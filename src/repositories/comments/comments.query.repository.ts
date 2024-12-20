import {ObjectId} from "mongodb";
import {InQueryPostModel} from "../../models/post/input/input.type.posts";
import {queryHelperToPost} from "../../utils/helpers/helper.query.get";
import {transformComment} from "../../utils/mappers/comment.mapper";
import {CommentModelClass} from "../../db/db";

export const CommentsQueryRepository = {
    async getComment(idComment: string) {
        const comment = await CommentModelClass.findOne({ _id: new ObjectId(idComment)});

        if (!comment) {
            return null;
        }

        return transformComment(comment);
    },
    async getAllCommentsToPostId(paramsToPostId: string, queryComments: InQueryPostModel) {
        const {pageNumber, pageSize, sortBy, sortDirection} = queryHelperToPost(queryComments);

        const comments = await CommentModelClass
            .find({postId: paramsToPostId})
            .sort({[sortBy]: sortDirection === 'asc' ? 1 : -1})
            .skip((Number(pageNumber) - 1) * Number(pageSize))
            .limit(Number(pageSize))
            .lean();

        const totalCountComments = await CommentModelClass.countDocuments({postId: paramsToPostId});

        const pagesCount = Math.ceil(totalCountComments / Number(pageSize));

        return {
            pagesCount: +pagesCount,
            page: +pageNumber,
            pageSize: +pageSize,
            totalCount: +totalCountComments,
            items: comments.map(comments => transformComment(comments))
        }
    },
}