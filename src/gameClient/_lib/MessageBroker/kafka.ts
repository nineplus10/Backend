import { Consumer, Kafka } from "kafkajs";
import { ConsumeFx, ConsumerEntry, MessageBrokerHandler } from ".";

export class KafkaHandler<ConsumerCase extends string> implements MessageBrokerHandler 
{
    private readonly _conn: Kafka
    private readonly _consumers: {
        [topic: string ]: ConsumerEntry<Consumer>[]
    } 

    constructor(
        private readonly clientId: string, 
        brokers: string[],
    ) {
        this._conn = new Kafka({ clientId: this.clientId, brokers: brokers })
        this._consumers = {}
    }

    async subscribeTo(
        topic: string,
        usecase: ConsumerCase, 
        onMsg: ConsumeFx,
    ): Promise<void> {
        if(!Object.keys(this._consumers).includes(topic)) {
            this._consumers[topic] = []
        }

        let idx = this._consumers[topic].findIndex(c => c.usecase === usecase)
        if(idx === -1) {
            const consumer = this._conn.consumer({
                groupId: usecase,
                allowAutoTopicCreation: false
            })

            const consumerEntry: ConsumerEntry<Consumer> = {
                usecase: usecase,
                conn: consumer,
                subscribers: []
            }

            await consumer.connect()
                .then(_ => consumer.subscribe({topic: topic, fromBeginning: false}))
                .then(_ => {
                    return consumer.run({
                        eachMessage: async({message}) => {
                            const value = message.value?.toString()
                            if(value) {
                                consumerEntry.subscribers.forEach(cFx => cFx(value))
                            }
                        }
                    })
                })
                .catch(err => {
                    console.log(`Error during connecting consumer: ${err}`)
                })

            this._consumers[topic].push(consumerEntry)
            idx = this._consumers[topic].length - 1
        }

        this._consumers[topic][idx].subscribers.push(onMsg)
    }

    async produceTo(topic: string, payload: any[]): Promise<void> {
        const producer = this._conn.producer()
        await producer.connect()
            .then(_ => {
                return producer.send({
                    topic: topic,
                    messages: payload.map(v => ({value: v}))
                })
            })
    }
}
