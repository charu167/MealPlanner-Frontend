import Navbar from "../components/Navbar/Navbar"; // Ensure this path is correct

const LayoutWithNavbar = ({ children }: any) => {
  return (
    <div>
      <Navbar />
      <div>{children}</div>
    </div>
  );
};

export default LayoutWithNavbar;
