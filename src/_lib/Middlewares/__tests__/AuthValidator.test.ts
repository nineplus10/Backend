import { Jwt } from "@lib/TokenHandler/jwt.ts"
import { BearerParser } from "@lib/TokenParser/bearer.ts"
import { AuthValidator } from "@middleware/AuthValidator.ts"
import { NextFunction, Request, Response } from "express"

const mockBearerParseToken = jest.fn()
jest.mock("@lib/TokenParser/bearer.ts", () => {
    return {
        BearerParser: jest.fn().mockImplementation(() => ({
            parseToken: mockBearerParseToken
        }))
    }
})

const mockJwtEncode = jest.fn()
const mockJwtDecode = jest.fn()
jest.mock("@lib/TokenHandler/jwt.ts", () => {
    return {
        Jwt: jest.fn().mockImplementation(() => ({
            encode: mockJwtEncode,
            decode: mockJwtDecode
        }))
    }
})


describe( "AuthValidator", () => {
    let mockRequest: Partial<Request>
    let mockResponse: Partial<Response>
    let mockNext: NextFunction = jest.fn()
    let authValidator: AuthValidator

    beforeEach(() => {
        authValidator = new AuthValidator(new Jwt(), new BearerParser())

        mockRequest = {}
        mockResponse = {}
    })

    describe("<handle>", () => {
        it("Should pass error for non-authenticated user", () => {
            authValidator.validate(
                <Request>mockRequest,
                <Response>mockResponse,
                mockNext)

            expect(mockNext).toHaveBeenCalled()
        })

        it("Should allow authenticated user", () => {
            mockRequest = {
                headers: {
                    authorization: "Bjir"
                }
            }

            authValidator.validate(
                <Request>mockRequest,
                <Response>mockResponse,
                mockNext)

            expect(mockNext).toHaveBeenCalledTimes(0)
        })
    })
})