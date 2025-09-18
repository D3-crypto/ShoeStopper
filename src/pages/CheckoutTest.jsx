import React from 'react';

const CheckoutTest = () => {
  console.log('🚀 [CHECKOUT TEST] Component is mounting...');
  
  return (
    <div style={{ 
      padding: '50px', 
      backgroundColor: '#ff0000', 
      color: 'white', 
      fontSize: '24px',
      minHeight: '100vh',
      textAlign: 'center'
    }}>
      <h1>CHECKOUT PAGE TEST - COMPONENT IS WORKING!</h1>
      <p>If you see this red page, the routing and component are working fine.</p>
      <p>The issue is likely in the original checkout component logic.</p>
    </div>
  );
};

export default CheckoutTest;