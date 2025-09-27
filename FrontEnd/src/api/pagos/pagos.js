import instancia from '../axios';

export const getPagos = async () => {
    return instancia.get('pago/listarPagosAdmin/');  
}

export const updatePago = async (id, data) => {
    return instancia.patch(`pago/actualizarEstadoPago/${id}/`, data);  
}

export const detailPago = async (id) => {
    return instancia.get(`pago/detallePagoAdmin/${id}/`);
}

export const marcarPagosEnMora = async () => {
    return instancia.get('pago/marcarPagosEnMora/');  
}

export const generarExpensas = async () => {
    return instancia.get('pago/generarExpensas/');  
}