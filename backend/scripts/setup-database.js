const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

// 数据库配置
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
};

async function setupDatabase() {
    let connection;
    
    try {
        console.log('🔄 正在连接MySQL服务器...');
        
        // 连接到MySQL服务器（不指定数据库）
        connection = await mysql.createConnection(dbConfig);
        
        console.log('✅ MySQL连接成功');
        
        // 读取SQL文件
        const sqlPath = path.join(__dirname, '../../database/schema.sql');
        const sqlContent = await fs.readFile(sqlPath, 'utf8');
        
        console.log('📖 正在执行数据库脚本...');
        
        // 执行SQL脚本
        await connection.execute(sqlContent);
        
        console.log('✅ 数据库创建成功！');
        console.log('');
        console.log('📊 数据库信息:');
        console.log('   数据库名: jifenbao_system');
        console.log('   表数量: 15个主要表');
        console.log('   视图数量: 3个统计视图');
        console.log('');
        console.log('🔐 默认管理员账号:');
        console.log('   管理员: admin / admin123');
        console.log('   经理: manager / manager123');
        console.log('   专员: operator / operator123');
        console.log('');
        console.log('🎉 数据库设置完成！现在可以启动API服务器了。');
        
    } catch (error) {
        console.error('❌ 数据库设置失败:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('');
            console.log('💡 解决方案:');
            console.log('   1. 确保MySQL服务器正在运行');
            console.log('   2. 检查数据库连接配置');
            console.log('   3. 验证用户名和密码');
        }
        
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// 检查MySQL连接
async function checkMySQLConnection() {
    try {
        const connection = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password
        });
        
        await connection.execute('SELECT 1');
        await connection.end();
        return true;
    } catch (error) {
        return false;
    }
}

// 主函数
async function main() {
    console.log('🚀 积分宝数据库设置工具');
    console.log('================================');
    
    // 检查MySQL连接
    console.log('🔍 检查MySQL连接...');
    const isConnected = await checkMySQLConnection();
    
    if (!isConnected) {
        console.log('❌ 无法连接到MySQL服务器');
        console.log('');
        console.log('请确保:');
        console.log('1. MySQL服务器正在运行');
        console.log('2. 用户名和密码正确');
        console.log('3. 主机地址可访问');
        console.log('');
        console.log('当前配置:');
        console.log(`   主机: ${dbConfig.host}`);
        console.log(`   用户: ${dbConfig.user}`);
        console.log(`   密码: ${dbConfig.password ? '已设置' : '未设置'}`);
        process.exit(1);
    }
    
    await setupDatabase();
}

// 如果直接运行此脚本
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { setupDatabase, checkMySQLConnection };
