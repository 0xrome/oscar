declare module 'jest-mock-express' {
    export function getMockReq(requestOptions?: any): any;
    export function getMockRes(responseOptions?: any): any;
}