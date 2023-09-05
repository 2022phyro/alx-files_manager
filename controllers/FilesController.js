import dbClient from '../utils/db';
import path from 'path';
import mongoDBCore from 'mongodb/lib/core';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { tmpdir } from 'os';
import { ObjectId } from 'mongodb';

const notId = Buffer.alloc(24, '0').toString('utf-8');

const FilesController = {
  async postUpload(req, res) {
    const { user } = req;
    const name = req.body ? req.body.name : null;
    const type = req.body ? req.body.type : null;
    const parentId = req.body && req.body.parentId ? req.body.parentId : 0;
    const isPublic =  req.body && req.body.isPublic ? req.body.isPublic : false;
    const data = req.body ? req.body.data : "";
    const fTypes = ['folder', 'file', 'image'];
    const root = `${process.env.FOLDER_PATH || ''}`.trim().length > 0
      ? process.env.FOLDER_PATH.trim()
      : path.join(tmpdir(), 'files_manager');
    if (!name) {
      return res.status(400).json({"error": "Missing name"});
    }
    if (!type || !fTypes.includes(type)) {
      return res.status(400).json({"error": "Missing type"});
    }AOA

    if (!req.body.data && type  !== 'folder') {
      return res.status(400).json({"error": "Missing data"});
    }

    let pId = 0;
    if (parentId && parentId !== 0) {
       pId = ObjectId.isValid(parentId) ? new ObjectId(parentId) : pId;
      const par = await dbClient.cli.db().collection('files').findOne({ _id: pId });
      if (!par) {
        return res.status(400).json({"error": "Parent not found"});
      }
      if (par.type !== 'folder') {
        return res.status(400).json({"error": "Parent is not a folder"});
      }
    }
    const doc = {
        'name': name, 'type': type,
        'parentId': pId,
        'userId': user._id,
        'isPublic': isPublic
    }
    if (type === 'folder') {
      const result = await dbClient.cli.db().collection('files').insertOne(doc);
      return res.status(201).json({
        'name': name, 'type': type, 'parentId': pId.toString(),
        'id': result.insertedId.toString(), 'userId': user._id.toString(),
        'isPublic': isPublic
     });
    }
    if (!fs.existsSync(root)) {
      fs.mkdirSync(root, { recursive: true });
    }
    const filename = uuidv4();
    const filePath = path.join(root, filename)

    const decoded = Buffer.from(data, 'base64');
    await fs.promises.writeFile(filePath, decoded);
    doc.localPath = filePath;
    const result = await dbClient.cli.db().collection('files').insertOne(doc);
    return res.status(201).json({
        'name': name, 'type': type, 'parentId': pId.toString(),
        'id': result.insertedId.toString(), 'userId': user._id.toString(),
        'isPublic': isPublic
    });
  }
    async getShow(req, res) {
    const { user } = req
    const fileId = req.params ? req.params.id : notId
    const file = await dbClient.cli.db().collection('files').findOne({
       _id: new mongoDBCore.BSON.ObjectId(ObjectId.isValid(fileId) ? fileId : notId) ,
      userId: user._id
    });
    if (!file) {
      return res.status(404).json({"error": "Not found"});
    }
    return res.json({
      id: file._id.toString(),
      userId: file.userId.toString(),
      name: file.name,
      type: file.type,
      isPublic: file.isPublic,
      parentId: file.parentId.toString(),
    });
  },
  async getIndex(req, res) {
    const { user } = req;
    const rootFolder = 0
    const pId = req.query ? req.query.parentId : rootFolder.toString();
    const pageSize = 20;
    const page = parseInt(req.query.page, 10) || 0;
    const pipe = [
      {
        $match: {
          userId: user._id,
          parentId: pId === rootFolder.tostring() ? 
            pId : new mongoDBCore.BSON.ObjectId(ObjectId.isValid(pId) ? pId : notId),
        }
      },
      { $sort: { _id: -1 } },
      {
        $skip: page * pageSize
      },
      {
        $limit: pageSize
      },
      {
        $project: {
            _id: 0,
            id: '$_id',
            userId: '$userId',
            name: '$name',
            type: '$type',
            isPublic: '$isPublic',
            parentId: {
              $cond: { if: { $eq: ['$parentId', '0'] }, then: 0, else: '$parentId' },
            },
          },
        },
    ]
    const docs = await dbClient.cli.db().collection('files').aggregate(pipe).toArray();

    return res.json(docs);
  }
}
export default FilesController;
