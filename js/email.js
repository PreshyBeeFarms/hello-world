// js/email.js

// ===== EMAILJS CONFIGURATION =====
const EMAILJS_PUBLIC_KEY = 'ZcDYWggclDgNSWjcu';
const EMAILJS_SERVICE_ID = 'service_ybkgs7m';
const EMAILJS_TEMPLATE_DONOR = 'template_i0qnhpd';
const EMAILJS_TEMPLATE_RECIPIENT = 'template_qfxc5kx';

// ===== SEND DONOR EMAIL =====
async function sendDonorEmail(donorData) {
    const templateParams = {
        donor_name: donorData.donor_name,
        donor_email: donorData.donor_email,
        recipient_name: donorData.recipient_name,
        recipient_location: donorData.recipient_location,
        animal_details: donorData.animal_details,
        total_amount: donorData.total_amount,
        donor_message: donorData.message || 'God bless you!'
    };

    try {
        const response = await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_DONOR,
            templateParams,
            EMAILJS_PUBLIC_KEY
        );
        return { success: true };
    } catch (error) {
        console.error('Donor email error:', error);
        return { success: false, error: error.text || error.message };
    }
}

// ===== SEND RECIPIENT EMAIL =====
async function sendRecipientEmail(donorData) {
    const templateParams = {
        recipient_name: donorData.recipient_name,
        recipient_email: donorData.recipient_email,
        donor_name: donorData.donor_name,
        animal_details: donorData.animal_details,
        donor_message: donorData.message || 'God bless you!'
    };

    try {
        const response = await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_RECIPIENT,
            templateParams,
            EMAILJS_PUBLIC_KEY
        );
        return { success: true };
    } catch (error) {
        console.error('Recipient email error:', error);
        return { success: false, error: error.text || error.message };
    }
}
