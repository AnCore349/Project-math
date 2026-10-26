import axios from "axios";
import {SERVER_DEV_URL} from "../../serverRouting/switch";
//!Attention, this URL need for deployment to Heroku.
// const REACT_APP_SERVER_URL = process.env.REACT_APP_SERVER_URL

export const POST = async (route, payloadRequest, options) => {
    return await axios.post(`${SERVER_DEV_URL}${route}`, payloadRequest, {
        withCredentials: true,
        headers: {authorization: options?.jwt
        }})
}

export const GET = async (route, payloadForConfigGET) => {
    return await axios.get(`${SERVER_DEV_URL}${route}`, {
        withCredentials: true,
        headers: {
            authorization: payloadForConfigGET?.jwt,
        }
    })
}


export const PUT = async (route, options) => {
    return await axios.put(`${SERVER_DEV_URL}${route}`, {}, {
        withCredentials: true,
        headers: {authorization: options?.jwt
        }})
}

export const DELETE = async  (route, deletePayload, options) => {
    return await axios.delete(`${SERVER_DEV_URL}${route}`, {
        withCredentials: true,
        headers: {
            authorization: options?.jwt,
        },
        data: deletePayload,
    })
}