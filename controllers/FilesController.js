import dbClient from '../utils/db';
import path from 'path';
import mongoDBCore from 'mongodb/lib/core';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

const FilesController = {
  async postUpload(req, res) {
    const { user } = req;
    const name = req.body.name || null;
    const type = req.body.type || 'none';
    const parentId = req.body.parentId || 0
    const isPublic = req.body.isPublic || false;
    const data = req.body.data || null;
    const fTypes = ['folder', 'file', 'image'];
    const root = process.env.FOLDER_PATH || '/tmp/files_manager';
    if (!name) {
      return res.status(400).json({"error": "Missing name"});
    }
    if (!fTypes.includes(type)) {
      return res.status(400).json({"error": "Missing type"});
    }

    if (!data && type  !== 'folder') {
      return res.status(400).json({"error": "Missing data"});
    }

    let pId = 0;
    if (parentId && parentId !== 0) {
      pId = new  mongoDBCore.BSON.ObjectId(parentId);
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
}
export default FilesController;