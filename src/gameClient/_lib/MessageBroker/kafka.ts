import { Kafka } from "kafkajs";

export const KafkaConn = new Kafka({
    clientId: "test",
    brokers: ["broker:9092"]
})