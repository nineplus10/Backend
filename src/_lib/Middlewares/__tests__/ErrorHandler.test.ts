import { AppErr, AppError } from "@lib/Error/AppError.ts"
import { ErrorHandler } from "@middleware/ErrorHandler.ts"
import { error } from "console"
import { NextFunction, Request, Response } from "express"

describe("ErrorHandler", () => {
    let mockRequest: Partial<Request>
    let mockResponse: Partial<Response>
    let mockNext: NextFunction = jest.fn()
    let errorHandler: ErrorHandler;

    beforeEach(() => {
        const errorHandler = new ErrorHandler()

        mockRequest = {}
        mockResponse = {
            status: jest.fn(),
            json: jest.fn()
        }
    })

    describe("<handle>", () => {
        it("Should pass error")
    })
})