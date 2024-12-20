import {transformPost} from "../../utils/mappers/post.mapper";
import {queryHelperToPost} from "../../utils/helpers/helper.query.get";
import {ObjectId} from "mongodb";
import {InQueryPostModel} from "../../models/post/input/input.type.posts";
import {OutGetAllPosts, OutPostModel} from "../../models/post/output/output.type.posts";
import {PostModelClass} from "../../db/db";

export const postsQueryRepository = {
    async getAllPost(queryParamsToPost: InQueryPostModel): Promise<OutGetAllPosts> {

        const {pageNumber, pageSize, sortBy, sortDirection} = queryHelperToPost(queryParamsToPost)

        const posts = await PostModelClass
            .find()
            .sort({[sortBy]: sortDirection === 'asc' ? 1 : -1})
            .skip((Number(pageNumber) - 1) * Number(pageSize))
            .limit(Number(pageSize))
            .lean();

        const totalCountBlogs = await PostModelClass.countDocuments();

        const pagesCount = Math.ceil(totalCountBlogs / Number(pageSize));

        return {
            pagesCount: +pagesCount,
            page: +pageNumber,
            pageSize: +pageSize,
            totalCount: +totalCountBlogs,
            items: posts.map(post => transformPost(post)),
        };
    },
    async giveOneToIdPost(id: string): Promise<OutPostModel | null> {
        const post = await PostModelClass.findOne({_id: new ObjectId(id)});

        if (!post) {
            return null;
        }

        return transformPost(post);
    }
}