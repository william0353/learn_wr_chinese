/**
 * 简单的 IndexedDB 操作库
 * 用于汉字学习记忆曲线数据存储
 */
class SimpleDB {
  constructor(dbName = "HanziLearningDB", version = 1) {
    this.dbName = dbName;
    this.version = version;
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // 创建汉字学习记录表
        if (!db.objectStoreNames.contains("hanziItems")) {
          const store = db.createObjectStore("hanziItems", { keyPath: "id" });
          store.createIndex("lesson", "lesson", { unique: false });
          store.createIndex("char", "char", { unique: false });
        }

        // 创建课程完成记录表
        if (!db.objectStoreNames.contains("completedLessons")) {
          db.createObjectStore("completedLessons", { keyPath: "lessonId" });
        }
      };
    });
  }

  async getAll(storeName) {
    if (!this.db) throw new Error("Database not initialized");
    const transaction = this.db.transaction([storeName], "readonly");
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async get(storeName, key) {
    if (!this.db) throw new Error("Database not initialized");
    const transaction = this.db.transaction([storeName], "readonly");
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async put(storeName, data) {
    if (!this.db) throw new Error("Database not initialized");

    // 转换为普通对象，防止 Vue Proxy 导致的 DataCloneError
    const plainData =
      typeof data === "object" && data !== null
        ? JSON.parse(JSON.stringify(data))
        : data;

    const transaction = this.db.transaction([storeName], "readwrite");
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.put(plainData);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName, key) {
    if (!this.db) throw new Error("Database not initialized");
    const transaction = this.db.transaction([storeName], "readwrite");
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.delete(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getByIndex(storeName, indexName, key) {
    if (!this.db) throw new Error("Database not initialized");
    const transaction = this.db.transaction([storeName], "readonly");
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);

    return new Promise((resolve, reject) => {
      const request = index.getAll(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async bulkPut(storeName, dataArray) {
    if (!this.db) throw new Error("Database not initialized");
    const transaction = this.db.transaction([storeName], "readwrite");
    const store = transaction.objectStore(storeName);

    const promises = dataArray.map((data) => {
      // 转换为普通对象
      const plainData =
        typeof data === "object" && data !== null
          ? JSON.parse(JSON.stringify(data))
          : data;

      return new Promise((resolve, reject) => {
        const request = store.put(plainData);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    });

    return Promise.all(promises);
  }

  async clearAll() {
    if (!this.db) throw new Error("Database not initialized");
    const storeNames = ["hanziItems", "completedLessons"];
    const transaction = this.db.transaction(storeNames, "readwrite");

    const promises = storeNames.map((storeName) => {
      return new Promise((resolve, reject) => {
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });

    return Promise.all(promises);
  }
}

// 全局数据库实例
const db = new SimpleDB();

// 初始化数据库
async function initDB() {
  try {
    await db.init();
    console.log("数据库初始化成功");
  } catch (error) {
    console.error("数据库初始化失败:", error);
  }
}

// 汉字学习数据管理类
class HanziLearningManager {
  constructor() {
    this.db = db;
  }

  // 创建汉字学习记录
  async createHanziItem(char, lesson) {
    // 直接使用汉字作为 ID (或者你可以使用 encodeURIComponent(char))
    // 这样 ID 是唯一的，且与课程无关
    const id = char;

    // 检查是否已经存在该字符的学习记录
    const existing = await this.db.get("hanziItems", id);
    if (existing) {
      console.log(`[SRS] 字符 "${char}" 已有学习记录，跳过创建`);
      return existing;
    }

    const now = Date.now();
    const item = {
      id: id,
      char: char,
      lesson: lesson,
      last_ts: now,
      created_at: now, // 记录初始学习时间，后续不再修改
      nextReviewAt: now, // 新学的汉字都是今天复习
      level: 0, // 初始等级为0
      mistakeCount: 0, // 初始错误次数为0
      isLeech: false, // 初始非leech
      stability_days: 1.0, // 保留旧字段以兼容
      ease: 2.0, // 保留旧字段以兼容
      history: [],
    };

    await this.db.put("hanziItems", item);
    return item;
  }

  // 获取所有汉字记录
  async getAllHanziItems() {
    return await this.db.getAll("hanziItems");
  }

  // 获取所有已学习的字符集合
  async getLearnedChars() {
    const items = await this.getAllHanziItems();
    return new Set(items.map((item) => item.char));
  }

  // 通过字符查找记录
  async getHanziItemByChar(char) {
    return await this.db.getByIndex("hanziItems", "char", char);
  }

  // 获取指定课程的汉字记录
  async getHanziItemsByLesson(lesson) {
    return await this.db.getByIndex("hanziItems", "lesson", lesson);
  }

  // 更新汉字记录
  async updateHanziItem(item) {
    await this.db.put("hanziItems", item);
  }

  // 标记课程为已完成
  async markLessonCompleted(lessonId) {
    const completedLesson = {
      lessonId: lessonId,
      completedAt: Date.now(),
    };
    await this.db.put("completedLessons", completedLesson);
  }

  // 检查课程是否已完成
  async isLessonCompleted(lessonId) {
    const result = await this.db.get("completedLessons", lessonId);
    return !!result;
  }

  // 获取所有已完成的课程
  async getCompletedLessons() {
    return await this.db.getAll("completedLessons");
  }

  // 清除所有学习数据
  async resetAllData() {
    await this.db.clearAll();
  }

  // 删除汉字记录
  async deleteHanziItem(id) {
    await this.db.delete("hanziItems", id);
  }
}

// 全局学习管理器实例
const learningManager = new HanziLearningManager();
