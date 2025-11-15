const { MongoClient, ObjectId } = require("mongodb");
const Log = require("./Log");
const User = require("./User");

class Chat {
   static async chatExist(database, user01Id, user02Id) {
    let foundChat = await database.collection("chats").findOne({
      $or: [
        { user01Id: user01Id, user02Id: user02Id },
        { user01Id: user02Id, user02Id: user01Id },
      ],
    });

    foundChat = foundChat ? true : false;
    return foundChat;
  }

  static async chatExistById(database, chatId) {
    let foundChat = await database
      .collection("chats")
      .findOne({ _id: new ObjectId(chatId) });

    foundChat = foundChat ? true : false;
    return foundChat;
  }

  static async createChat(
    database,
    user01Id,
    user02Id,
    chatId = null,
    time = new Date()
  ) {
    try {
      if (
        !user01Id ||
        user01Id.trim() === "" ||
        !user02Id ||
        user02Id.trim() === ""
      ) {
        const error = new Error("user01Id id and user02 id cannot by empty.");
        Log.writeError("Error creating chat:", error);
        throw error;
      }

      if (!(await User.userExistById(database, user01Id))) {
        const error = new Error("user01 id " + user01Id + " doesnt exist.");
        Log.writeError("Error creating chat:", error);
        throw error;
      }
      if (!(await User.userExistById(database, user02Id))) {
        const error = new Error("user02 id " + user02Id + " doesnt exist.");
        Log.writeError("Error creating chat:", error);
        throw error;
      }

      if (await this.chatExist(database, user01Id, user02Id)) {
        const error = new Error("Chat with this users already exist.");
        Log.writeError("Error creating chat:", error);
        throw error;
      }

      chatId = chatId ? new ObjectId(chatId) : new ObjectId();
      let insertion = await database.collection("chats").insertOne({
        _id: chatId,
        user01Id: user01Id,
        user02Id: user02Id,
        time: time,
      });

      Log.writeInformation(
        "Registering chat with user01 id of  " +
          user01Id +
          " and user02 id of " +
          user02Id
      );
    } catch (error) {
      Log.writeError(
        "Error registering chat with user01 id of  " +
          user01Id +
          " and user02 id of " +
          user02Id,
        error
      );
      throw error;
    }
    return;
  }

  static async readChatById(database, chatId) {
    let foundChat;
    try {
      if (!chatId || chatId.trim() === "") {
        const error = new Error("chat id cannot be empty or undefined.");
        Log.writeError("error reading chat:", error);
        throw error;
      }
      foundChat = await database
        .collection("chats")
        .findOne({ _id: new ObjectId(chatId) });
      if (!foundChat || foundChat === undefined) {
        const error = new Error("Chat not found.");
        Log.writeError("Error reading chat of id " + chatId + ":", error);
        throw error;
      } else {
        Log.writeInformation("Finding chat of the id: " + chatId);
      }
    } catch (error) {
      Log.writeError("Error finding chat of the id " + chatId + ":", error);
      throw error;
    }
    return;
  }

  static async readChatByUser01Id(database, user01Id) {
    let foundChat;
    try {
      if (!user01Id || user01Id.trim() === "") {
        const error = new Error("user01 id cannot be empty or undefined.");
        Log.writeError("error reading chat by user01 id:", error);
        throw error;
      }
      foundChat = await database
        .collection("chats")
        .findOne({ user01Id: user01Id });
      if (!foundChat || foundChat === undefined) {
        const error = new Error("Chat not found.");
        Log.writeError(
          "Error reading chat with user01 id " + user01Id + ":",
          error
        );
        throw error;
      } else {
        Log.writeInformation("Reading chat of the id: " + foundChat._id);
      }
    } catch (error) {
      Log.writeError(
        "Error reading chat of the user01 id " + user01Id + ":",
        error
      );
      throw error;
    }
    return;
  }
  static async readChatByUser02Id(database, user02Id) {
    let foundChat;
    try {
      if (!user02Id || user02Id.trim() === "") {
        const error = new Error("user02 id cannot be empty or undefined.");
        Log.writeError("error reading chat by user02 id:", error);
        throw error;
      }
      foundChat = await database
        .collection("chats")
        .findOne({ user02Id: user02Id });
      if (!foundChat || foundChat === undefined) {
        const error = new Error("Chat not found.");
        Log.writeError(
          "Error reading chat with user02 id " + user02Id + ":",
          error
        );
        throw error;
      } else {
        Log.writeInformation("Reading chat of the id: " + foundChat._id);
      }
    } catch (error) {
      Log.writeError(
        "Error reading chat of the user02 id " + user02Id + ":",
        error
      );
      throw error;
    }
    return;
  }

  static async readAllChats(database) {
    let findedUsers;

    try {
      findedUsers = await database.collection("chats").find().toArray();
      Log.writeInformation("Reading chats.");
      findedUsers.map((chat) => {
      });
    } catch (error) {
      Log.writeError("Error finding chats:", error);
      throw error;
    }
    return;
  }

  static async readChatsById(database, userId) {
    try{
      if(!database) {
        Log.writeError(`Error reading chat by id: `, new Error('invalid database'));
        return false;
      } else if (!userId) {
        Log.writeError(`Error reading chat by id: `, new Error('invalid userId'));
        return false;
      } else {
        const chats = await database.collection("chats").find({
          $or: [
            { user01Id: userId },
            { user02Id: userId }
          ]
        }).toArray();
        return chats;
    }
    
    } catch(error) {
      Log.writeError(`Error reading chat by id: `, error);
      return false;
    }
  }

  static async getAllChatsIds(database) {
    try {
      let chats = await database
        .collection("chats")
        .find({}, { projection: { _id: 1 } })
        .toArray();
      chats = chats.map((user) => user._id.toString());
      Log.writeInformation("Reading chats ids.");

      return chats;
    } catch (error) {
      Log.writeError("Error reading chats ids:", error);
      throw error;
    }
  }

  static async ReadChatByUsers(database, user01Id, user02Id) {
    try{
      if(!database) {
        Log.writeError('Error reading chat by users: ', new Error('invalid database'));
        return false;
      }
      if(!user01Id) {
        Log.writeError('Error reading chat by users: ', new Error('invalid user01Id'));
        return false;
      }
      if(!user02Id) {
        Log.writeError('Error reading chat by users: ', new Error('invalid user02Id'));
        return false;
      }

      const result= await database.collection("chats").findOne({
        $or: [
          { user01Id: user01Id, user02Id: user02Id },
          { user01Id: user02Id, user02Id: user01Id },
        ],
      });

      return result;
    }
    catch(error){
      Log.writeError('Error reading chat by users: ', new Error('cannot read chat by this users ids'));
      return false;
    }
  }

  static async deleteChatById(database, chatId) {
    let deleteResult;

    try {
      if (!chatId || chatId.trim() === "") {
        const error = new Error("chat id cannot be empty or undefined.");
        Log.writeError("Error deleting chat:", error);
        throw error;
      }

      deleteResult = await database
        .collection("chats")
        .deleteOne({ _id: new ObjectId(chatId) });
      if (deleteResult.deletedCount == 1) {
        Log.writeInformation("Deleting chat of id " + chatId);
      } else {
        const error = new Error("Chat of id " + chatId + " not found");
        Log.writeError("Error deleting chat:", error);
        throw error;
      }
    } catch (error) {
      Log.writeError("Error deleting chat of id " + chatId + ":", error);
      throw error;
    }
    return;
  }

  static async deleteChatsByUser01Id(database, user01Id) {
    let deleteResult;

    try {
      if (!user01Id || user01Id.trim() === "") {
        const error = new Error("user01 id cannot be empty or undefined.");
        Log.writeError("Error deleting chat:", error);
        return false;
      }

      deleteResult = await database
        .collection("chats")
        .deleteMany({ user01Id: user01Id });
      if (deleteResult.deletedCount > 0) {
        Log.writeInformation("Deleting chats of sender id " + user01Id);
      } else {
        const error = new Error(
          "Chats of user01 id " + user01Id + " not found"
        );
        Log.writeError("Error deleting chats:", error);
        return false;
      }
    } catch (error) {
      Log.writeError(
        "Error deleting chats of user01 id " + user01Id + ":",
        error
      );
      return false;
    }
    return true;
  }

  static async deleteChatsByUser02Id(database, user02Id) {
    let deleteResult;

    try {
      if (!user02Id || user02Id.trim() === "") {
        const error = new Error("user02 id cannot be empty or undefined.");
        Log.writeError("Error deleting chat:", error);
        return false;
      }

      deleteResult = await database
        .collection("chats")
        .deleteMany({ user02Id: user02Id });
      if (deleteResult.deletedCount > 0) {
        Log.writeInformation("Deleting chats of sender id " + user02Id);
      } else {
        const error = new Error(
          "Chats of user02 id " + user02Id + " not found"
        );
        Log.writeError("Error deleting chats:", error);
        return false;
      }
    } catch (error) {
      Log.writeError(
        "Error deleting chats of user02 id " + user02Id + ":",
        error
      );
      return false;
    }
    return true;
  }

  static async deleteAllChats(database) {
    try {
      const deleteResult = await database.collection("chats").deleteMany({});
      if (deleteResult.deletedCount >= 1) {
        Log.writeInformation("Removing all chats");
      } else {
        const error = new Error("The database doesnt have any chat.");
        Log.writeError("Error removing all chats:", error);
        throw error;
      }
    } catch (error) {
      Log.writeError("Error removing all chats:", error);
      throw error;
    }
    return;
  }

  static async deleteChatBetweenUsers(database, user01Id, user02Id) {

    try{
      const { ObjectId } = require("mongodb");

        const chatToDelete = await database.collection("chats").findOne({
          $or: [
            { user01Id: user01Id, user02Id: user02Id },
            { user01Id: user02Id, user02Id: user01Id },
          ],
        });

      if(chatToDelete) {
        await database.collection("chats").deleteOne({ _id: chatToDelete._id });
        Log.writeInformation(`Deleting chat between users`);
        return true;
      } 
      else {
        Log.writeError(`Error deleting chat between users`, new Error('chat doens exist or is invalid.'));
        return false;
      }
    } catch(error) {
      Log.writeError(`Error deleting chat between users:`, error)
      return false;
    }
  }

  static async deleteChatByContact(database, user01Id, contactName) {
    try {
      if(!database) {
        Log.writeError(`Error deleting chat by contact:`, new Error('invalid database entry'));
        return false;
      }
      else if(!user01Id) {
        Log.writeError(`Error deleting chat by contact:`, new Error('invalid unser01Id entry'));
        return false;
      }

      else if(!contactName){
        Log.writeError(`Error deleting chat by contact:`, new Error('invalid contactName entry'));
        return false;
      }

      else {
        user01Id = user01Id.toString();
        const contact = await User.readUserByName(database, contactName);
        if(!contact) {
          Log.writeError(`Error deleting chat by contact:`, new Error("contact name doesnt exist in this database"));
          return false;
        } else {
          const contactId = contact._id.toString();
          const contactIsRemoved = await this.deleteChatBetweenUsers(database, user01Id, contactId);
          return contactIsRemoved;
        }
      }
  }
  catch(error) {
    Log.writeError(`Error deleting chat by contact:`, error);
    return false;
  }

  }
}

module.exports = Chat;
