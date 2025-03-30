import React from 'react';

const ProductDescription = ({ description }) => {
  return (
    <div className="product-description" style={{ whiteSpace: 'pre-wrap' }}>
      {description}
    </div>
  );
};

export default ProductDescription;