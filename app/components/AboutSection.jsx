const AboutSection = () => {
  return (
    <section className="bg-cat-frappe-overlay2 dark:bg-cat-frappe-crust p-20 rounded-2xl shadow-lg mt-10 text-center">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-4xl text-center mb-5 relative inline-block text-[#e5c890] after:content-[''] after:absolute after:bottom-[-10px] after:left-1/2 after:-translate-x-1/2 after:w-1/2 after:h-[4px] after:bg-gradient-to-r after:from-[#ef9f76] after:to-[#e5c890]  after:rounded-[2px] font-bold">
          ✨ about this blog ✨
        </h2>
        <div className="text-[#c6d0f5] dark:text-[#f2d5cf]">
          <p>welcome to my blog! 🌈</p>
          <p>This is my blog! I plan to use this simple next.js site to share my thoughts and ideas with the world, warning I am not always right.</p>
          <h3 className="font-bold text-2xl text-[#e5c890]">Preface: 🌈</h3>
          <p>
            I intend to somewhat use this site as a place for me to rant about things I am currently interest in. I might not always be acuurate in the information I write. I will try to cite my sources as much as possible. Just keep in mind that I am not convey information in a 100% factual manner but rather I will write about things from my current understanding of the subject. If I say something inaccurate or convey information in a way you take offense to, please reach out to me.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
