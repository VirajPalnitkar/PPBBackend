const generateOrderId = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000); // 0-999
  return `ORD-${timestamp}-${random}`;
};

module.exports = generateOrderId;