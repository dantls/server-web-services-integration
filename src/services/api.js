import axios from 'axios';

const api = axios.create({
    baseURL: `http://${process.env.HOST_SERVER}:${process.env.PORT_SERVER}`,
});

export {api};