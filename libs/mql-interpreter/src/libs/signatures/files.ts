import { BuiltinSignaturesMap } from "./types";

// https://docs.mql4.com/files
export const filesBuiltinSignatures: BuiltinSignaturesMap = {
  FileClose: {
    args: [],
    returnType: "bool",
    description: "Closes a previously opened file",
  },
  FileCopy: {
    args: [],
    returnType: "bool",
    description: "Copies the original file from a local or shared folder to another file",
  },
  FileDelete: {
    args: [],
    returnType: "bool",
    description: "Deletes a specified file",
  },
  FileFindClose: {
    args: [],
    returnType: "bool",
    description: "Closes search handle",
  },
  FileFindFirst: {
    args: [],
    returnType: "int",
    description:
      "Starts the search of files in a directory in accordance with the specified filter",
  },
  FileFindNext: {
    args: [],
    returnType: "int",
    description: "Continues the search started by the FileFindFirst() function",
  },
  FileFlush: {
    args: [],
    returnType: "bool",
    description: "Writes to a disk all data remaining in the input/output file buffer",
  },
  FileGetInteger: {
    args: [],
    returnType: "int",
    description: "Gets an integer property of a file",
  },
  FileIsEnding: {
    args: [],
    returnType: "bool",
    description: "Defines the end of a file in the process of reading",
  },
  FileIsExist: {
    args: [],
    returnType: "bool",
    description: "Checks the existence of a file",
  },
  FileIsLineEnding: {
    args: [],
    returnType: "bool",
    description: "Defines the end of a line in a text file in the process of reading",
  },
  FileMove: {
    args: [],
    returnType: "bool",
    description: "Moves or renames a file",
  },
  FileOpen: {
    args: [],
    returnType: "bool",
    description: "Opens a file with a specified name and flag",
  },
  FileOpenHistory: {
    args: [],
    returnType: "bool",
    description: "Opens file in the current history directory or in its subfolders",
  },
  FileReadArray: {
    args: [],
    returnType: "bool",
    description: "Reads arrays of any type except for string from the file of the BIN type",
  },
  FileReadBool: {
    args: [],
    returnType: "bool",
    description:
      "Reads from the file of the CSV type a string from the current position till a delimiter (or till the end of a text line) and converts the read string to a value of bool type",
  },
  FileReadDatetime: {
    args: [],
    returnType: "datetime",
    description:
      'Reads from the file of the CSV type a string of one of the formats: "YYYY.MM.DD HH:MM:SS", "YYYY.MM.DD" or "HH:MM:SS" - and converts it into a datetime value',
  },
  FileReadDouble: {
    args: [],
    returnType: "double",
    description: "Reads a double value from the current position of the file pointer",
  },
  FileReadFloat: {
    args: [],
    returnType: "float",
    description: "Reads a float value from the current position of the file pointer",
  },
  FileReadInteger: {
    args: [],
    returnType: "int",
    description: "Reads int, short or char value from the current position of the file pointer",
  },
  FileReadLong: {
    args: [],
    returnType: "long",
    description: "Reads a long type value from the current position of the file pointer",
  },
  FileReadNumber: {
    args: [],
    returnType: "double",
    description:
      "Reads from the file of the CSV type a string from the current position till a delimiter (or til the end of a text line) and converts the read string into double value",
  },
  FileReadString: {
    args: [],
    returnType: "string",
    description: "Reads a string from the current position of a file pointer from a file",
  },
  FileReadStruct: {
    args: [],
    returnType: "bool",
    description:
      "Reads the contents from a binary file  into a structure passed as a parameter, from the current position of the file pointer",
  },
  FileSeek: {
    args: [],
    returnType: "bool",
    description:
      "Moves the position of the file pointer by a specified number of bytes relative to the specified position",
  },
  FileSize: {
    args: [],
    returnType: "long",
    description: "Returns the size of a corresponding open file",
  },
  FileTell: {
    args: [],
    returnType: "long",
    description: "Returns the current position of the file pointer of a corresponding open file",
  },
  FileWrite: {
    args: [],
    returnType: "bool",
    description: "Writes data to a file of CSV or TXT type",
  },
  FileWriteArray: {
    args: [],
    returnType: "bool",
    description: "Writes arrays of any type except for string into a file of BIN type",
  },
  FileWriteDouble: {
    args: [],
    returnType: "bool",
    description:
      "Writes value of the double type from the current position of a file pointer into a binary file",
  },
  FileWriteFloat: {
    args: [],
    returnType: "bool",
    description:
      "Writes value of the float type from the current position of a file pointer into a binary file",
  },
  FileWriteInteger: {
    args: [],
    returnType: "bool",
    description:
      "Writes value of the int type from the current position of a file pointer into a binary file",
  },
  FileWriteLong: {
    args: [],
    returnType: "bool",
    description:
      "Writes value of the long type from the current position of a file pointer into a binary file",
  },
  FileWriteString: {
    args: [],
    returnType: "bool",
    description:
      "Writes the value of a string parameter into a BIN or TXT file starting from the current position of the file pointer",
  },
  FileWriteStruct: {
    args: [],
    returnType: "bool",
    description:
      "Writes the contents of a structure passed as a parameter into a binary file, starting from the current position of the file pointer",
  },
  FolderClean: {
    args: [],
    returnType: "bool",
    description: "Deletes all files in the specified folder",
  },
  FolderCreate: {
    args: [],
    returnType: "bool",
    description: "Creates a folder in the Files directory",
  },
  FolderDelete: {
    args: [],
    returnType: "bool",
    description:
      "Removes a selected directory. If the folder is not empty, then it can't be removed",
  },
};
