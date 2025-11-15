const { MongoClient, ObjectId } = require("mongodb");
const Log = require("./Log");

class User {
  //Os métodos da classe User são estáticos uma vez que sua função é somente manipular a coleção users do banco de dados.

  static async userExistById(database, userId) {
    let foundUser = await database
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });
    foundUser = foundUser ? true : false;

    return foundUser;
  }

  static async createUser(database, userName, userPassword, userId = null) {
    let insertion = null;
    try {
      if (!userName || userName.trim() === "") {
        const error = new Error("User name is required!");
        Log.writeError("Error inserting user:", error);
        return false;
      }

      if (!userPassword || userPassword.trim() === "") {
        const error = new Error("User password is required!");
        Log.writeError("Error inserting user:", error);
        return false;
      }

      const userExist = await this.readUserByName(database, userName);
      if(userExist) {
        const error = new Error("User already exist!");
        Log.writeError("Error inserting user:", error);
        return false;
      }
        userId = userId ? new ObjectId(userId) : new ObjectId();
        insertion = await database
        .collection("users")
        .insertOne({ _id: userId, name: userName, password: userPassword });
        Log.writeInformation("Registering user " + userName + " with id " + userId );
    } catch (error) {
      Log.writeError(
        "Error inserting user" + userName + " with id " + userId + ":",
        error
      );
      return false;
    }
    return this.readUserByName(database, userName);
  }

  static async readUserById(database, id) {
    let foundUser;
    try {
      if (!id || id.trim() === "") {
        const error = new Error("id cannot be empty or undefined.");
        Log.writeError("Error reading user by id:", error);
        return false;
      }
      foundUser = await database
        .collection("users")
        .findOne({ _id: new ObjectId(id) });
      if (!foundUser || foundUser === undefined) {
        const error = new Error("User not found!");
        Log.writeError("Error finding user of id " + id + ":", error);
        return false;
      } else {
        Log.writeInformation("Finding user of the id: " + id);
      }
    } catch (error) {
      Log.writeError("Error finding user of the id " + id + ":", error);
      return false;
    }
    return foundUser;
  }

  static async readUserByName(database, name) {
    let foundUser;
    try {
      if (name.trim() === "") {
        const error = new Error("name cannot be empty.");
        Log.writeError("Error reading user by name: ", error);
        return false;
      }
      if (!name) {
        const error = new Error("Name invalid!");
        Log.writeError("Error finding user " + name + ":", error);
        return false;
      }
      
      foundUser = await database.collection("users").findOne({ name: name });

      if (!foundUser || foundUser === undefined) {
        const error = new Error("Name not found.");
        Log.writeError("Error finding user " + name + ":", error);
        return false;
      }else {
        Log.writeInformation( "Found user " + name + " by his name");
        return foundUser;
      }

    } catch(error) {
      Log.writeError("Error finding user by his name:", error);
      return false;
    }
    
    
  }

  static async readUserByNameAndPassword(database, name, password) {
    let foundUser;
    try {
      if (name.trim() === "" || password.trim() === "") {
        const error = new Error("name and password cannot be empty.");
        Log.writeError("Error reading user by name and password:", error);
        return false;
      }
      if (!name || !password) {
        const error = new Error("Name or password incorrect.!");
        Log.writeError("Error finding user " + name + ":", error);
        return false;
      }
      foundUser = await database
        .collection("users")
        .findOne({ name: name, password: password });
      if (!foundUser || foundUser === undefined) {
        const error = new Error("Name or password incorrect.");
        Log.writeError("Error finding user " + name + ":", error);
        return false;
      } else {
        Log.writeInformation(
          "Finding user" + name + "by his name and password"
        );
        return foundUser;
      }
    } catch (error) {
      Log.writeError("Error finding user by his name and password:", error);
      return false;
    }
    return true;
  }

  static async readAllUsers(database) {
    let findedUsers;

    try {
      findedUsers = await database.collection("users").find().toArray();
      Log.writeInformation("Reading users.");
      findedUsers.map((user) => {
      });
    } catch (error) {
      Log.writeError("Error finding users:", error);
      throw error;
    }
    return;
  }

  static async getAllUsersIds(database) {
    try {
      let users = await database
        .collection("users")
        .find({}, { projection: { _id: 1 } })
        .toArray();
      users = users.map((user) => user._id.toString());
      Log.writeInformation("Reading user ids.");

      return users;
    } catch (error) {
      Log.writeError("Error reading user ids:", error);
      throw error;
    }
  }

  static async deleteUserById(database, id) {
    let deleteResult;

    try {
      if (!id || id.trim() === "") {
        const error = new Error("id cannot be empty or undefined.");
        Log.writeError("Error deleting user:", error);
        return false;
      }

      deleteResult = await database
        .collection("users")
        .deleteOne({ _id: new ObjectId(id) });
      if (deleteResult.deletedCount == 1) {
        Log.writeInformation("Deleting user of id " + id);
      } else {
        const error = new Error("user of id " + id + " not found");
        Log.writeError("Error deleting user:", error);
        return false;
      }
    } catch (error) {
      Log.writeError("Error deleting user of id " + id + ":", error);
      return false;
    }
    return true;
  }

  static async deleteUsersByIds(database, ...userIds) {
    const selectedUserIds = userIds.map((userId) => new ObjectId(userId));
    const ids = [...userIds];

    try {
      if (!userIds || userIds.length === 0) {
        const error = new Error("user id(s) cannot be empty or undefined");
        Log.writeError("Error deleting user by id(s):", error);
        throw error;
      }

      const deleteResult = await database
        .collection("users")
        .deleteMany({ _id: { $in: selectedUserIds } });
      if (deleteResult.deletedCount >= 1) {
        Log.writeInformation("Deleting users of ids " + ids);
      } else {
        const error = new Error("Cannot find users of ids " + ids);
        Log.writeError("Error deleting users:", error);
        throw error;
      }
    } catch (error) {
      Log.writeError("Error deleting users " + ids + ":", error);
      throw error;
    }
    return;
  }

  static async deleteAllUsers(database) {
    try {
      const deleteResult = await database.collection("users").deleteMany({});
      if (deleteResult.deletedCount >= 1) {
        Log.writeInformation("Removing all users");
      } else {
        const error = new Error("The database doesnt have any user.");
        Log.writeError("Error removing all users:", error);
        throw error;
      }
    } catch (error) {
      Log.writeError("Error removing all users:", error);
      throw error;
    }
    return;
  }

  static async updateUserById(database, userId, name, password) {

    if(!database) {
      Log.writeError('Error updating user by id: ', new Error('invalid database'));
      return false;
    }
    else if(!userId) {
      Log.writeError('Error updating user by id: ', new Error('invalid userId'));
      return false;
    }
    else if(!name) {
      Log.writeError('Error updating user by id: ', new Error('invalid name'));
      return false;
    }
    else if(!password) {
      Log.writeError('Error updating user by id: ', new Error('invalid password'));
      return false;
    }
    else {
      try {
        const result = await database.collection("users").updateOne(
          { _id: new ObjectId(userId) }, 
          { 
            $set: { 
              name: name, 
              password: password 
            } 
          }
        );

        if (result.modifiedCount > 0) {
          Log.writeInformation(`User ${userId} was updated successfully.`);
          return true;
        } else {
          Log.writeError("Error updating user: ", new Error('Cant update user.') );
          return false;
        }
      }
      catch(error) {
        Log.writeError('Error updating user: ', error);
        return false;
      }
  }
}
}

module.exports = User;
