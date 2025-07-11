import api from '../api';

export const getMyBookings = async () => {
    try {
        const response = await api.get('/api/bookings');
        return response.data;
    } catch (error) {
        console.error('Error fetching bookings:', error);
        throw error;
    }
};

export const getBookingByPNR = async (pnr) => {
    try {
        const response = await api.get(`/api/bookings/pnr/${pnr}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching booking by PNR:', error);
        throw error;
    }
};

export const cancelBooking = async (bookingId) => {
    try {
        const response = await api.put(`/api/bookings/${bookingId}/cancel`);
        return response.data;
    } catch (error) {
        console.error('Error cancelling booking:', error);
        throw error;
    }
};
