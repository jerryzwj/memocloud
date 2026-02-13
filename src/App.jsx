import React, { useState, useEffect, useRef } from 'react';
import { createClient } from 'webdav';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [memos, setMemos] = useState([]);
  const [currentMemo, setCurrentMemo] = useState(null);
  const [memoTitle, setMemoTitle] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const textareaRef = useRef(null);

  // WebDAV配置
  const webdavConfig = {
    url: import.meta.env.VITE_WEBDAV_URL || 'https://wajima.infini-cloud.net/dav/',
    username: import.meta.env.VITE_WEBDAV_USERNAME || '',
    password: import.meta.env.VITE_WEBDAV_PASSWORD || ''
  };

  // 切换暗色模式
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // 登录处理
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // 验证用户登录账号密码
      const loginUsername = import.meta.env.VITE_LOGIN_USERNAME || 'admin';
      const loginPassword = import.meta.env.VITE_LOGIN_PASSWORD || 'password123';

      if (username !== loginUsername || password !== loginPassword) {
        throw new Error('用户名或密码错误');
      }

      // 测试WebDAV连接
      const client = createClient(webdavConfig.url, {
        username: webdavConfig.username,
        password: webdavConfig.password,
        digest: true,
        maxBodyLength: Infinity
      });

      // 检查是否能访问根目录
      try {
        await client.getDirectoryContents('/');
      } catch (err) {
        console.error('WebDAV连接错误:', err);
        // 如果连接失败，仍然允许用户登录，使用本地存储作为备用
        console.warn('WebDAV连接失败，将使用本地存储作为备用');
      }

      // 保存登录状态到本地存储
      localStorage.setItem('webdavUsername', webdavConfig.username);
      localStorage.setItem('webdavPassword', webdavConfig.password);
      localStorage.setItem('isLoggedIn', 'true');

      setIsLoggedIn(true);
      await loadMemos();
    } catch (err) {
      setError('登录失败，请检查账号密码');
      console.error('登录错误:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 加载备忘录列表
  const loadMemos = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const client = createClient(webdavConfig.url, {
        username: webdavConfig.username,
        password: webdavConfig.password,
        digest: true,
        maxBodyLength: Infinity
      });

      // 检查memos目录是否存在，不存在则创建
      try {
        await client.getDirectoryContents('/memos');
      } catch {
        try {
          await client.createDirectory('/memos');
        } catch (err) {
          console.error('创建memos目录失败:', err);
        }
      }

      // 获取备忘录列表
      try {
        const contents = await client.getDirectoryContents('/memos');
        const memoFiles = contents.filter(item => item.filename.endsWith('.json'));

        const loadedMemos = [];
        for (const file of memoFiles) {
          try {
            const content = await client.getFileContents(`/memos/${file.filename}`, { format: 'text' });
            const memo = JSON.parse(content);
            loadedMemos.push(memo);
          } catch (err) {
            console.error(`加载备忘录文件 ${file.filename} 失败:`, err);
          }
        }

        // 按更新时间排序
        loadedMemos.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        setMemos(loadedMemos);
      } catch (err) {
        console.error('获取备忘录列表失败:', err);
        // 尝试从本地存储加载备忘录
        const localMemos = localStorage.getItem('localMemos');
        if (localMemos) {
          try {
            const parsedMemos = JSON.parse(localMemos);
            parsedMemos.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
            setMemos(parsedMemos);
            console.log('从本地存储加载备忘录成功');
          } catch (err) {
            console.error('解析本地备忘录失败:', err);
          }
        }
      }
    } catch (err) {
      setError('加载备忘录失败，将使用本地存储');
      console.error('加载备忘录错误:', err);
      // 尝试从本地存储加载备忘录
      const localMemos = localStorage.getItem('localMemos');
      if (localMemos) {
        try {
          const parsedMemos = JSON.parse(localMemos);
          parsedMemos.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
          setMemos(parsedMemos);
          console.log('从本地存储加载备忘录成功');
        } catch (err) {
          console.error('解析本地备忘录失败:', err);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 富文本编辑函数
  const formatText = (command) => {
    if (command === 'createLink') {
      const url = prompt('请输入链接地址:');
      if (url) {
        document.execCommand('createLink', false, url);
      }
    } else if (command === 'insertHorizontalRule') {
      document.execCommand('insertHorizontalRule', false, null);
    } else if (command === 'todoList') {
      // 插入代办复选框
      const todoItem = prompt('请输入代办事项:');
      if (todoItem) {
        // 创建一个临时元素来构建待办项
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = `<div style="display: flex; align-items: center; gap: 8px; margin: 8px 0; padding: 8px; background-color: var(--secondary); border-radius: var(--radius);">
          <input type="checkbox" style="cursor: pointer; width: 16px; height: 16px;">
          <span>${todoItem}</span>
        </div>`;
        
        // 获取构建好的元素
        const todoElement = tempDiv.firstChild;
        
        // 添加复选框点击事件
        const checkbox = todoElement.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('click', function(e) {
          e.stopPropagation(); // 防止触发contentEditable的编辑行为
          const span = this.nextElementSibling;
          if (this.checked) {
            span.style.textDecoration = 'line-through';
            span.style.color = 'var(--muted-foreground)';
          } else {
            span.style.textDecoration = 'none';
            span.style.color = 'var(--foreground)';
          }
        });
        
        // 插入到编辑器中
        if (textareaRef.current) {
          const selection = window.getSelection();
          if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(todoElement);
            // 移动光标到待办项后面
            range.setStartAfter(todoElement);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
          } else {
            textareaRef.current.appendChild(todoElement);
          }
        }
      }
    } else if (command === 'uploadFile') {
      // 触发文件上传
      document.getElementById('file-upload').click();
    } else {
      document.execCommand(command, false, null);
    }
  };

  // 文件上传处理
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // 生成唯一文件名
      const fileName = `${Date.now()}-${file.name}`;
      
      // 尝试上传到WebDAV
      try {
        const client = createClient(webdavConfig.url, {
          username: webdavConfig.username,
          password: webdavConfig.password,
          digest: true,
          maxBodyLength: Infinity
        });

        // 检查uploads目录是否存在，不存在则创建
        try {
          await client.getDirectoryContents('/uploads');
        } catch {
          await client.createDirectory('/uploads');
        }

        // 上传文件
        await client.putFileContents(`/uploads/${fileName}`, file);
        console.log('文件上传到WebDAV成功');

        // 插入文件链接到编辑器
        const fileUrl = `${webdavConfig.url}uploads/${fileName}`;
        const fileHTML = `<div style="margin: 8px 0;">
          <a href="${fileUrl}" target="_blank" rel="noopener noreferrer" style="color: var(--primary); text-decoration: none;">
            📎 ${file.name}
          </a>
        </div>`;
        document.execCommand('insertHTML', false, fileHTML);
      } catch (err) {
        console.error('文件上传到WebDAV失败:', err);
        alert('文件上传失败，请检查网络连接');
      }
    } catch (err) {
      console.error('文件上传错误:', err);
      alert('文件上传失败');
    }
  };

  // 保存备忘录
  const saveMemo = async () => {
    if (!currentMemo) return;

    setIsLoading(true);
    setError(null);

    try {
      // 从contentEditable元素获取内容
      let editorContent = '';
      if (textareaRef.current) {
        editorContent = textareaRef.current.innerHTML;
      }

      const editorData = {
        blocks: [{
          id: `block-${Date.now()}`,
          type: 'paragraph',
          data: {
            text: editorContent
          }
        }],
        time: Date.now(),
        version: '2.29.1'
      };

      const updatedMemo = {
        ...currentMemo,
        title: memoTitle,
        content: editorData,
        updatedAt: new Date().toISOString()
      };

      // 保存到WebDAV
      try {
        const client = createClient(webdavConfig.url, {
          username: webdavConfig.username,
          password: webdavConfig.password,
          digest: true,
          maxBodyLength: Infinity
        });

        await client.putFileContents(
          `/memos/${updatedMemo.id}.json`,
          JSON.stringify(updatedMemo, null, 2),
          { overwrite: true }
        );

        console.log('保存到WebDAV成功');
      } catch (err) {
        console.error('保存到WebDAV失败:', err);
        console.warn('将使用本地存储作为备用');
      }

      // 更新本地状态
      setMemos(prevMemos => {
        const index = prevMemos.findIndex(memo => memo.id === updatedMemo.id);
        let newMemos;
        if (index !== -1) {
          newMemos = [...prevMemos];
          newMemos[index] = updatedMemo;
        } else {
          newMemos = [...prevMemos, updatedMemo];
        }
        // 按更新时间排序
        newMemos.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        // 备份到本地存储
        localStorage.setItem('localMemos', JSON.stringify(newMemos));
        return newMemos;
      });

      setError('保存成功');
      setTimeout(() => setError(null), 2000);
    } catch (err) {
      setError('保存失败');
      console.error('保存备忘录错误:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 创建新备忘录
  const createMemo = () => {
    const newMemo = {
      id: `memo-${Date.now()}`,
      title: '新备忘录',
      content: {
        blocks: [],
        time: Date.now(),
        version: '2.29.1'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setCurrentMemo(newMemo);
    setMemoTitle(newMemo.title);
  };

  // 编辑备忘录
  const editMemo = (memo) => {
    setCurrentMemo(memo);
    setMemoTitle(memo.title);
  };

  // 删除备忘录
  const deleteMemo = async (memoId) => {
    if (!confirm('确定要删除这个备忘录吗？')) return;

    setIsLoading(true);
    setError(null);

    try {
      // 从WebDAV删除
      try {
        const client = createClient(webdavConfig.url, {
          username: webdavConfig.username,
          password: webdavConfig.password,
          digest: true,
          maxBodyLength: Infinity
        });

        await client.deleteFile(`/memos/${memoId}.json`);
        console.log('从WebDAV删除成功');
      } catch (err) {
        console.error('从WebDAV删除失败:', err);
        console.warn('将使用本地存储作为备用');
      }

      // 更新本地状态
      setMemos(prevMemos => {
        const newMemos = prevMemos.filter(memo => memo.id !== memoId);
        // 备份到本地存储
        localStorage.setItem('localMemos', JSON.stringify(newMemos));
        return newMemos;
      });

      // 如果当前正在编辑的备忘录被删除，返回列表
      if (currentMemo && currentMemo.id === memoId) {
        setCurrentMemo(null);
        setMemoTitle('');
      }

      setError('删除成功');
      setTimeout(() => setError(null), 2000);
    } catch (err) {
      setError('删除失败');
      console.error('删除备忘录错误:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 返回备忘录列表
  const backToList = () => {
    setCurrentMemo(null);
    setMemoTitle('');
    if (editorInstanceRef.current) {
      editorInstanceRef.current.destroy();
      editorInstanceRef.current = null;
    }
  };

  // 检查本地存储中的登录状态
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');

    if (isLoggedIn === 'true') {
      // 从环境变量中获取WebDAV配置
      webdavConfig.username = import.meta.env.VITE_WEBDAV_USERNAME || '';
      webdavConfig.password = import.meta.env.VITE_WEBDAV_PASSWORD || '';
      setIsLoggedIn(true);
      loadMemos();
    }
  }, []);

  // 登录页面
  if (!isLoggedIn) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="card w-full max-w-md">
          <h1 className="text-2xl font-bold mb-4 text-center">Memo Cloud</h1>
          {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">用户名</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? '登录中...' : '登录'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 编辑备忘录页面
  if (currentMemo) {
    return (
      <div className="container">
        <header className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              className="btn btn-secondary"
              onClick={backToList}
            >
              ← 返回
            </button>
            <h1 className="text-xl font-bold">编辑备忘录</h1>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              className="btn btn-secondary"
              onClick={() => deleteMemo(currentMemo.id)}
            >
              删除
            </button>
            <button
              className="btn btn-primary"
              onClick={saveMemo}
              disabled={isLoading}
            >
              {isLoading ? '保存中...' : '保存'}
            </button>
          </div>
        </header>

        {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}

        <div className="card mb-4">
          <input
            type="text"
            value={memoTitle}
            onChange={(e) => setMemoTitle(e.target.value)}
            placeholder="输入标题"
            className="text-xl font-bold border-0 focus:ring-0 mb-2 w-full"
            style={{ fontSize: '1.2rem' }}
          />
          <div className="text-sm text-muted flex flex-wrap gap-2">
            <span>创建于: {new Date(currentMemo.createdAt).toLocaleString()}</span>
            {currentMemo.updatedAt !== currentMemo.createdAt && (
              <span>
                更新于: {new Date(currentMemo.updatedAt).toLocaleString()}
              </span>
            )}
          </div>
        </div>

        <div className="card">
          {/* 简单的富文本编辑工具栏 */}
          <div className="flex gap-2 mb-2 flex-wrap">
            <button className="btn btn-secondary text-sm py-2 px-3" onClick={() => formatText('bold')}>
              B
            </button>
            <button className="btn btn-secondary text-sm py-2 px-3" onClick={() => formatText('italic')}>
              I
            </button>
            <button className="btn btn-secondary text-sm py-2 px-3" onClick={() => formatText('underline')}>
              U
            </button>
            <button className="btn btn-secondary text-sm py-2 px-3" onClick={() => formatText('insertUnorderedList')}>
              •
            </button>
            <button className="btn btn-secondary text-sm py-2 px-3" onClick={() => formatText('insertOrderedList')}>
              1.
            </button>
            <button className="btn btn-secondary text-sm py-2 px-3" onClick={() => formatText('createLink')}>
              🔗
            </button>
            <button className="btn btn-secondary text-sm py-2 px-3" onClick={() => formatText('insertHorizontalRule')}>
              ≡
            </button>
            <button className="btn btn-secondary text-sm py-2 px-3" onClick={() => formatText('todoList')}>
              ✅
            </button>
            <button className="btn btn-secondary text-sm py-2 px-3" onClick={() => formatText('uploadFile')}>
              📎
            </button>
            <input
              type="file"
              id="file-upload"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </div>
          {/* 编辑区域 */}
          <div
            ref={textareaRef}
            contentEditable
            style={{
              minHeight: '400px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '1rem',
              outline: 'none',
              whiteSpace: 'pre-wrap',
              fontFamily: 'inherit',
              fontSize: '1rem',
              lineHeight: '1.6'
            }}
            dangerouslySetInnerHTML={{ __html: currentMemo.content?.blocks?.[0]?.data?.text || '' }}
          />
        </div>
      </div>
    );
  }

  // 备忘录列表页面
  return (
    <div className="container">
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Memo Cloud</h1>
        <div className="flex gap-2">
          <button
            className="btn btn-secondary"
            onClick={() => setIsDarkMode(!isDarkMode)}
          >
            {isDarkMode ? '明亮模式' : '黑暗模式'}
          </button>
          <button
            className="btn btn-primary"
            onClick={createMemo}
          >
            新建备忘录
          </button>
        </div>
      </header>

      {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {memos.map(memo => (
          <div 
            key={memo.id} 
            className="card hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
            onClick={() => editMemo(memo)}
          >
            <div className="flex justify-between items-start mb-2">
              <h2 className="font-bold text-lg truncate flex-grow">
                {memo.title}
              </h2>
            </div>
            <div className="text-sm text-muted mb-3">
              {new Date(memo.updatedAt).toLocaleString()}
            </div>
            <div className="text-sm mb-4 line-clamp-4 min-h-[80px]">
              {/* 优化备忘录内容预览 */}
              {memo.content.blocks.length > 0 ? (
                <div dangerouslySetInnerHTML={{ 
                  __html: memo.content.blocks[0].data.text.replace(/<[^>]*>/g, '') 
                    .substring(0, 120) + '...'
                }} />
              ) : (
                <div className="text-muted">无内容</div>
              )}
            </div>
          </div>
        ))}

        {memos.length === 0 && !isLoading && (
          <div className="col-span-full text-center py-16 text-muted">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-medium mb-2">暂无备忘录</h3>
            <p>点击右上角按钮创建你的第一条备忘录</p>
          </div>
        )}

        {isLoading && (
          <div className="col-span-full text-center py-16">
            <div className="animate-pulse">
              <div className="text-4xl mb-4">⏳</div>
              <p>加载中...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

// 编辑器插件（实际使用时需要安装对应的包）
// 这里只是占位，实际项目中需要安装：
// npm install @editorjs/header @editorjs/list @editorjs/image @editorjs/code @editorjs/link
const Header = {
  // 占位实现
};

const List = {
  // 占位实现
};

const ImageTool = {
  // 占位实现
};

const CodeTool = {
  // 占位实现
};

const LinkTool = {
  // 占位实现
};