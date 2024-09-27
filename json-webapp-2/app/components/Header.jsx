// import Image from "next/image";

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-light-purple via-light-blue to-light-green py-5">
      <div className="flex justify-center items-center">
        <div className="text-center">
          <a href="/">
            <img
              src="/bee.png"
              alt="Logo"
              width={100}
              height={100}
              className="transition-transform duration-300 hover:scale-110"
            />
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
