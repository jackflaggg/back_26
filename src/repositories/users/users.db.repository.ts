import {ObjectId} from "mongodb";
import {OutUserServiceModel} from "../../models/user/ouput/output.type.users";
import {RecoveryPasswordModelClass, UserModelClass} from "../../db/db";

export const UsersDbRepository = {
    async createUser(body: OutUserServiceModel): Promise<string | null> {
        const newUser = await UserModelClass.insertMany([body])

        if (!newUser[0]) {
            return null;
        }

        return newUser[0]._id.toString();
    },

    async updatePassword(userId: string, newPassword: string) {
        const upDate = await UserModelClass.updateOne({_id: new ObjectId(userId)}, {$set: {password: newPassword}});
        return true
    },

    async updateEmailConfirmation(id: string, code: string): Promise<boolean> {
        const updateEmail = await UserModelClass.updateOne(
            {_id: new ObjectId(id)},
            {$set:
                    {
                        'emailConfirmation.confirmationCode': code,
                        'emailConfirmation.expirationDate': null,
                        'emailConfirmation.isConfirmed': true}
            });

        return updateEmail.matchedCount === 1;
    },

    async updatePasswordAndEmailConfirmation(id: string, newPassword: string, code: string): Promise<boolean> {
        const updateEmail = await UserModelClass.updateOne(
            {_id: new ObjectId(id)},
            {$set:
                    {
                        password: newPassword,
                        'emailConfirmation.confirmationCode': code,
                        'emailConfirmation.expirationDate': null,
                        'emailConfirmation.isConfirmed': true}
            });

        return updateEmail.matchedCount === 1;
    },

    async updateCodeAndDateConfirmation(userId: string, code: string, expirationDate: Date) {
        await RecoveryPasswordModelClass.create({userId, recoveryCode: code, expirationDate});
        return true;
    },

    async deleteUser(id: string): Promise<boolean> {
        const deleteUser = await UserModelClass.deleteOne({_id: new ObjectId(id)});
        return deleteUser.deletedCount === 1;
    },

    async findByLoginUser(login: string): Promise<any | null> {
        const searchUser = await UserModelClass.find({login}).lean();
        if (!searchUser[0]) {
            return null;
        }
        return searchUser[0];
    },

    async findByEmailUser(email: string): Promise<any | null> {
        const searchEmail =  await UserModelClass.find({ email: email }).lean();

        if (!searchEmail[0]) {
            return null;
        }

        return searchEmail[0]._id;
    },
    async findUserByLoginOrEmail(loginOrEmail: string): Promise<null | any> {

        const filter = {
            $or: [
                {login: loginOrEmail} ,
                {email: loginOrEmail}
            ]
        }

        const findUser = await UserModelClass.find(filter).lean();

        if (!findUser[0]) {
            return null;
        }

        return findUser[0];
    },

    async findCodeUser(code: string): Promise<any | null> {

        const findUser = await UserModelClass.find({
            'emailConfirmation.confirmationCode': code
        }).lean();

        if (!findUser[0]){
            console.log('[UsersDbRepository] не нашел юзера!')
            return null;
        }

        return findUser[0];
    },

}