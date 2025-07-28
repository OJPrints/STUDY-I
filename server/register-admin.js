const fetch = require('node-fetch');

async function registerAdmin() {
  try {
    console.log('🔧 Registering Admin Account...');
    console.log('📧 Email: ojterry@gmail.com');
    console.log('🔑 Password: terry2000');
    console.log('👤 Role: admin');
    console.log('');

    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firstName: 'OJ',
        lastName: 'Terry',
        email: 'ojterry@gmail.com',
        password: 'terry2000',
        department: 'computer-science',
        role: 'admin'
      })
    });

    const data = await response.json();

    if (data.success) {
      console.log('✅ Admin account created successfully!');
      console.log('📧 Email:', data.user.email);
      console.log('👤 Name:', data.user.firstName, data.user.lastName);
      console.log('🔑 Role:', data.user.role);
      console.log('🏢 Department:', data.user.department);
      console.log('🎫 Token:', data.token ? 'Generated' : 'None');
      console.log('');
      console.log('🎉 You can now login with:');
      console.log('📧 Email: ojterry@gmail.com');
      console.log('🔑 Password: terry2000');
      console.log('🚀 Full admin access enabled!');
    } else {
      console.log('⚠️  Registration response:', data.message);
      
      if (data.message && data.message.includes('already exists')) {
        console.log('✅ Admin account already exists - you can login with:');
        console.log('📧 Email: ojterry@gmail.com');
        console.log('🔑 Password: terry2000');
      }
    }

  } catch (error) {
    console.error('❌ Error registering admin:', error.message);
    console.log('');
    console.log('🔧 Make sure your server is running:');
    console.log('1. Open another terminal');
    console.log('2. cd server');
    console.log('3. npm start');
    console.log('4. Then run this script again');
  }
}

registerAdmin();
