const { MongoClient, ObjectId } = require("mongodb");
const Log = require("./Log");
const User = require("./User");
const Chat = require("./Chat");

class Message {
  static async createMessage(
    database,
    chatId,
    senderId,
    content,
    messageId = null,
    time = new Date()
  ) {
    try {
      if (!chatId || chatId.trim() === "") {
        const error = new Error("chat id cannot by empty.");
        Log.writeError("Error creating message:", error);
        throw error;
      }

      if (!(await Chat.chatExistById(database, chatId))) {
        const error = new Error("chat id " + chatId + " doesnt exist.");
        Log.writeError("Error creating message:", error);
        throw error;
      }

      if (!senderId || senderId.trim() === "") {
        const error = new Error("Sender id cannot by empty.");
        Log.writeError("Error creating message:", error);
        throw error;
      }

      if (!(await User.userExistById(database, senderId))) {
        const error = new Error("sender id " + senderId + " doesnt exist.");
        Log.writeError("Error creating message:", error);
        throw error;
      }

      if (!content || content.trim() === "") {
        const error = new Error("content cannot by empty.");
        Log.writeError("Error creating message:", error);
        throw error;
      }

      messageId = messageId ? new ObjectId(messageId) : new ObjectId();

      const insertion = await database.collection("messages").insertOne({
        _id: messageId,
        chatId: chatId,
        senderId: senderId,
        content: content,
        time: time,
      });
      Log.writeInformation(
        "Creating message with sender id of  " +
          senderId +
          " and message id of " +
          messageId
      );
    } catch (error) {
      Log.writeError(
        "Error creating message with sender id of  " +
          senderId +
          " and message id of " +
          messageId,
        error
      );
      throw error;
    }
    return;
  }

  static async readMessageById(database, messageId) {
    let foundMessage;
    try {
      if (!messageId || messageId.trim() === "") {
        const error = new Error("message id cannot be empty or undefined");
        Log.writeError("Error reading message of id " + messageId + ":", error);
        throw error;
      }
      foundMessage = await database
        .collection("messages")
        .findOne({ _id: new ObjectId(messageId) });
      if (!foundMessage || foundMessage === undefined) {
        const error = new Error("Message not found.");
        Log.writeError("Error reading message of id " + messageId + ":", error);
        throw error;
      } else {
        Log.writeInformation("Reading message of the id: " + messageId);
      }
    } catch (error) {
      Log.writeError(
        "Error reading message of the id " + messageId + ":",
        error
      );
      throw error;
    }
    return;
  }

  static async readMessagesBySenderId(database, senderId) {
    try {
      if (!senderId || senderId.trim() === "") {
        const error = new Error("sender id cannot be empty or undefined.");
        Log.writeError("Error reading messages by senderId:", error);
        throw error;
      }

      // Buscar todas as mensagens enviadas pelo senderId na coleção "messages"
      const foundMessages = await database
        .collection("messages")
        .find({ senderId: senderId })
        .toArray();

      if (!foundMessages || foundMessages.length === 0) {
        const error = new Error("No messages found for senderId " + senderId);
        Log.writeError(
          "Error reading messages with senderId " + senderId + ":",
          error
        );
        throw error;
      }

      // Mostrar cada mensagem encontrada
      foundMessages.forEach((msg) => {
        Log.writeInformation("Reading message id: " + msg._id);
      });
    } catch (error) {
      Log.writeError(
        "Error reading messages of sender id " + senderId + ":",
        error
      );
      throw error;
    }
  }

  static async readMessagesByChatId(database, chatId) {
    try {
      if(!database){
        Log.writeError('Error reading messages by chat id:', new Error('invalid database'));
        return false;
      }
       if(!chatId){
        Log.writeError('Error reading messages by chat id:', new Error('invalid chatId'));
        return false;
      }
  
      const messages = await database
          .collection("messages")
          .find({ chatId: chatId })
          .sort({ time: 1 }) 
          .toArray();
       return messages;
    }
    catch(error) {
      Log.writeError('Error reading messages by chat id:', error);
      return false;
    }
  }

  static async readMessagesBySenderAndReceiver(database, senderId, receiverId) {
    try {
      if (!senderId || senderId.trim() === "") {
        const error = new Error(
          "sender id cannot be empty, undefined or null."
        );
        Log.writeError(
          "Error reading messages from this sender and receiver: ",
          error
        );
        throw error;
      }

      if (!receiverId || receiverId.trim() === "") {
        const error = new Error(
          "receiver id cannot be empty, undefined or null."
        );
        Log.writeError(
          "Error reading messages from this sender and receiver: ",
          error
        );
        throw error;
      }

      const chat = await database.collection("chats").findOne({
        $or: [
          { user01Id: senderId, user02Id: receiverId },
          { user01Id: receiverId, user02Id: senderId },
        ],
      });

      if (!chat) {
        const error = new Error(
          "no chat found between " + senderId + "and" + receiverId
        );
        Log.writeError("Error reading messages from the chat:", error);
        throw error;
      }

      const messages = await database
        .collection("messages")
        .find({ chatId: chat._id })
        .sort({ time: 1 })
        .toArray();

      if (!messages || messages.length === 0) {
        Log.writeInformation("messages not found.");
      }

      Log.writeInformation(
        "Reading messages from the chat id of " +
          chat._id +
          "between the sender id " +
          senderId +
          "and the receiver id " +
          receiverId
      );
      return;
    } catch (error) {
      Log.writeError(
        "Error reading messages between sender id " +
          senderId +
          " and receiver id " +
          receiverId,
        error
      );
      throw error;
    }
  }

  static async deleteMessageById(database, messageId) {
    let deleteResult;

    try {
      if (!messageId || messageId.trim === "") {
        const error = new Error("message cannot be empty or null.");
        Log.writeError("Error deleting message:", error);
        throw error;
      }

      deleteResult = await database
        .collection("messages")
        .deleteOne({ _id: new ObjectId(messageId) });
      if (deleteResult.deletedCount == 1) {
        Log.writeInformation("Deleting message of id " + messageId);
      } else {
        const error = new Error("Message of id " + messageId + " not found");
        Log.writeError("Error deleting message:", error);
        throw error;
      }
    } catch (error) {
      Log.writeError("Error deleting message of id " + messageId + ":", error);
      throw error;
    }
    return;
  }

  static async removeMessagesByChatIdAndSenderId(database, chatId, senderId) {
    try {
      if (!chatId || chatId.trim() === "") {
        const error = new Error("chat id cannot be empty or undefined");
        Log.writeError(
          "Error removing messages by chat id and sender id:",
          error
        );
        return false;
      }

      if (!senderId || senderId.trim() === "") {
        const error = new Error("sender id cannot be empty or undefined");
        Log.writeError(
          "Error removing messages by chat id and sender id:",
          error
        );
        return false;
      }

      const result = await database.collection("messages").deleteMany({
        chatId: chatId,
        senderId: senderId,
      });

      Log.writeInformation(
        "Removing " +
          result.deletedCount +
          "messages from the chat id " +
          chatId +
          " and sender id " +
          senderId
      );
      return true;
    } catch (error) {
      Log.writeError(
        "Error removing messages by chat id and sender id:",
        error
      );
      return false;
    }
  }

  static async deleteMessagesBySenderId(database, senderId) {
    try{
      if(!database) {
        Log.writeError('Error deleting message: ', new Error('invalid database'));
        return false;
      }
      else if(!senderId) {
        Log.writeError('Error deleting message: ', new Error('invalid senderId'));
        return false;
      }
      else {
        const result = await database.collection("messages").deleteMany({
          senderId: senderId,
        });
        return true;

      }
    }
    catch(error) {
      Log.writeError('Error deleting message: ', error);
      return false;
    }
  }

}

module.exports = Message;
