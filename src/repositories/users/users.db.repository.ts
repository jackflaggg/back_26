import {ObjectId, WithId} from "mongodb";
import {UserDbType} from "../../models/db/db.models";
import {OutUserFindLoginOrEmail, OutUserServiceModel} from "../../models/user/ouput/output.type.users";
import {UserModelClass} from "../../db/db";

export const UsersDbRepository = {
    async createUser(body: OutUserServiceModel): Promise<string | null> {
        const newUser = await UserModelClass.insertMany([body])

        if (!newUser || !newUser[0]._id) {
            return null;
        }
        return newUser[0]._id.toString();
    },
    async deleteUser(id: string): Promise<boolean> {
        const deleteUser = await UserModelClass.deleteOne({_id: new ObjectId(id)});
        return deleteUser.acknowledged;
    },
    async findByLoginUser(login: string): Promise<UserDbType | null> {
        const searchUser = await UserModelClass.findOne({login});
        if (!searchUser || !searchUser._id) {
            return null;
        }
        return searchUser;
    },
    async findByEmailUser(email: string): Promise<WithId<UserDbType> | null> {
        const searchEmail =  await UserModelClass.findOne({ email: email });

        if (!searchEmail || !searchEmail._id) {
            return null;
        }

        return searchEmail;
    },
    async findUserByLoginOrEmail(loginOrEmail: string): Promise<null | OutUserFindLoginOrEmail> {

        const filter = {
            $or: [
                {login: loginOrEmail} ,
                {email: loginOrEmail}
            ]
        }
        const findUser = await UserModelClass.findOne(filter)
        if (!findUser || !findUser._id) {
            return null;
        }
        return findUser;
    },
    async findCodeUser(code: string): Promise<WithId<UserDbType> | null> {

        const findUser = await UserModelClass.findOne({
            'emailConfirmation.confirmationCode': code
        });

        if (!findUser || !findUser._id){
            console.log('[UsersDbRepository] не нашел юзера!')
            return null;
        }

        return findUser;
    },
    async updateEmailConfirmation(id: string, code: string): Promise<boolean> {
        const updateEmail = await UserModelClass.updateOne(
            {_id: new ObjectId(id)},
            {$set: {'emailConfirmation.confirmationCode': code, 'emailConfirmation.expirationDate': null, 'emailConfirmation.isConfirmed': true}});

        return updateEmail.modifiedCount === 1;
    },
    async updateCodeAndDateConfirmation(userId: string, code: string, expirationDate: Date) {
        const result = await UserModelClass.updateOne(
            {_id: new ObjectId(userId)},
            {
                $set: {
                    'emailConfirmation.confirmationCode': code,
                    'emailConfirmation.expirationDate': expirationDate
                }
            }
        )
        return result.modifiedCount === 1;
    }
}