import {RecoveryPasswordModelClass} from "../../db/db";

export const RecoveryRecoveryRepository = {
    async createCodeAndDateConfirmation(userId: string, code: string, expirationDate: Date): Promise<boolean> {
        await RecoveryPasswordModelClass.create({userId, recoveryCode: code, expirationDate});
        return true;
    },
    async deleteDate(userId: string){

        await RecoveryPasswordModelClass.deleteOne({userId});
        return true;
    },
    async findRecoveryCodeUser(code: string): Promise<any | null> {

        const findUser = await RecoveryPasswordModelClass.findOne({
            recoveryCode: code
        });

        if (!findUser){
            console.log('[UsersDbRepository] не нашел юзера!')
            return null;
        }

        return findUser;
    },
    async updateRecoveryCode(userId: string, code: string): Promise<boolean> {
        await RecoveryPasswordModelClass.updateOne({userId, recoveryCode: code}, {$set: {expirationDate: null}});
        return true;
    }
}