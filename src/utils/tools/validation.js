// validation.js - 表单验证工具函数

/**
 * 验证密码格式
 * @param {string} password - 要验证的密码
 * @returns {string} 错误信息，为空表示验证通过
 */
export const validatePassword = (password) => {
  // 检查长度
  if (password.length < 8) {
    return '密码长度至少为8个字符';
  }
  if (password.length > 25) {
    return '密码长度不能超过25个字符';
  }
  
  // 检查是否包含字母
  if (!/[a-zA-Z]/.test(password)) {
    return '密码必须包含至少一个字母';
  }
  
  // 检查是否包含数字
  if (!/[0-9]/.test(password)) {
    return '密码必须包含至少一个数字';
  }
  
  // 检查是否包含特殊字符
  if (!/[^a-zA-Z0-9]/.test(password)) {
    return '密码必须包含至少一个特殊字符';
  }
  
  return '';
};

/**
 * 验证确认密码是否与新密码一致
 * @param {string} newPassword - 新密码
 * @param {string} confirmPassword - 确认密码
 * @returns {string} 错误信息，为空表示验证通过
 */
export const validateConfirmPassword = (newPassword, confirmPassword) => {
  if (newPassword && confirmPassword !== newPassword) {
    return '两次输入的新密码不一致';
  }
  return '';
};

/**
 * 验证用户名格式
 * @param {string} username - 要验证的用户名
 * @returns {string} 错误信息，为空表示验证通过
 */
export const validateUsername = (username) => {
  if (!username.trim()) {
    return '请输入用户名';
  }
  if (username.length < 2) {
    return '用户名长度至少为2个字符';
  }
  if (username.length > 20) {
    return '用户名长度不能超过20个字符';
  }
  if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(username)) {
    return '用户名只能包含字母、数字、下划线和中文';
  }
  return '';
};

/**
 * 验证个人简介
 * @param {string} introduction - 个人简介
 * @param {number} maxLength - 最大长度
 * @returns {string} 错误信息，为空表示验证通过
 */
export const validateIntroduction = (introduction, maxLength = 200) => {
  if (introduction.length > maxLength) {
    return `简介不能超过${maxLength}字`;
  }
  return '';
};

/**
 * 验证图片文件
 * @param {File} file - 图片文件
 * @param {number} maxSizeMB - 最大文件大小（MB）
 * @returns {string} 错误信息，为空表示验证通过
 */
export const validateImageFile = (file, maxSizeMB = 5) => {
  if (!file) {
    return '请选择图片文件';
  }
  
  // 验证文件类型
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return '请选择JPG、PNG、GIF或WebP格式的图片';
  }
  
  // 验证文件大小
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return `图片大小不能超过${maxSizeMB}MB`;
  }
  
  return '';
};