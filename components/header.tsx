import Image from "next/image";
export default function Header() {
  return (
    <div className="relative flex items-center px-4 py-2 font-bold min-w-[1200px]">
      <h1 className="text-xl absolute left-1/2 transform -translate-x-1/2">
        Sprint Retrospection Board
      </h1>

      <h1 className="text-xl ml-auto">Platform Team</h1>
    </div>
  );
}
