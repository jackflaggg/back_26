import {emailAdapter} from "../utils/adapters/email.adapter";

export const emailManagers = {
    async sendEmailRecoveryMessage(email: string,  confirmationCode: string) {
        return await emailAdapter.sendEmail(email, confirmationCode);
    },
    async sendPasswordRecoveryMessage(email: string,  confirmationCode: string) {
        return await emailAdapter.sendPassword(email, confirmationCode);
    },
}