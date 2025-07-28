import React from 'react';

export default function Image({ onClick }: { onClick: () => void }) {
  return (
    <div>
        <Image
        src= "/delete-icon.png"
      alt="delete"
      width={50}
      height={50}
      onClick={onClick}/>

       
      
    </div>
  )
}
