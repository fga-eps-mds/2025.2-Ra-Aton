import { Group, User } from '@prisma/client'
import GroupRepository from './group.repository'
import { auth } from '../../middlewares/auth';


class GroupService {
    getAllGroups = async (): Promise<Group[]> => {
        const groups = await GroupRepository.findAll();
        return groups.map((group: Group) => {
            return group;
        })
    }
    createGroup = async (data: any, author: any): Promise<Group> => {
        const newGroup = await GroupRepository.createGroup(data, author);
        return newGroup;
    }
}

export default new GroupService();