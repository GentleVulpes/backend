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
        console.log(
          "Chat id: " +
            foundChat._id +
            "\nChat sender: " +
            foundChat.user01Id +
            "\nChat receiver id: " +
            foundChat.user02Id +
            "\n"
        );
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
        console.log(
          "Chat id: " +
            foundChat._id +
            "\nChat user01 id: " +
            foundChat.user01Id +
            "\nChat user02 id: " +
            foundChat.user02Id +
            "\n"
        );
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
        console.log(
          "Chat id: " +
            foundChat._id +
            "\nChat user01 id: " +
            foundChat.user01Id +
            "\nChat user02 id: " +
            foundChat.user02Id +
            "\n"
        );
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
        console.log(
          "Chat id: " +
            chat._id +
            "\nChat user01 id: " +
            chat.user01Id +
            "\nChat user02 id: " +
            chat.user02Id +
            "\n"
        );
      });
    } catch (error) {
      Log.writeError("Error finding chats:", error);
      throw error;
    }
    return;
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
        throw error;
      }

      deleteResult = await database
        .collection("chats")
        .deleteMany({ user01Id: user01Id });
      if (deleteResult.deletedCount >= 1) {
        Log.writeInformation("Deleting chats of sender id " + user01Id);
      } else {
        const error = new Error(
          "Chats of user01 id " + user01Id + " not found"
        );
        Log.writeError("Error deleting chats:", error);
        throw error;
      }
    } catch (error) {
      Log.writeError(
        "Error deleting chats of user01 id " + user01Id + ":",
        error
      );
      throw error;
    }
    return;
  }

  static async deleteChatsByUser02Id(database, user02Id) {
    let deleteResult;

    try {
      if (!user02Id || user02Id.trim() === "") {
        const error = new Error("user02 id cannot be empty or undefined.");
        Log.writeError("Error deleting chat:", error);
        throw error;
      }

      deleteResult = await database
        .collection("chats")
        .deleteMany({ user02Id: user02Id });
      if (deleteResult.deletedCount >= 1) {
        Log.writeInformation("Deleting chats of sender id " + user02Id);
      } else {
        const error = new Error(
          "Chats of user02 id " + user02Id + " not found"
        );
        Log.writeError("Error deleting chats:", error);
        throw error;
      }
    } catch (error) {
      Log.writeError(
        "Error deleting chats of user02 id " + user02Id + ":",
        error
      );
      throw error;
    }
    return;
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
}

module.exports = Chat;
