import React from "react";
import NextImage from "next/image"; // ✅ import Next.js Image

type Props = {
  onClick: () => void;
};

export default function Image({ onClick }: Props) {
  return (
    <div>
      <NextImage
        src="/delete-icon.png"
        alt="delete"
        width={50}
        height={50}
        onClick={onClick}
      />
    </div>
  );
}
