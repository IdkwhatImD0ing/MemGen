import { motion } from "framer-motion";
import Contributor from "./components/Contributor";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({ subsets: ["latin"] });

export default function About() {
  const contacts = [
    {
      name: "Bill Zhang",
      linkedin: "https://www.linkedin.com/in/bill-zhang-57976b1b3/",
      github: "https://github.com/IdkwhatImD0ing",
      info: "Incoming M.S. in Computer Science at University of Southern California",
      photo: "/bill.jpg",
    },
    {
      name: "Jerry Liu",
      linkedin: "https://www.linkedin.com/in/jllewis11/",
      github: "https://github.com/jllewis11",
      info: "M.S. in Computer Science at San Jose State University",
      photo: "/jerry.jpg",
    },
    {
      name: "Trique Nguyen",
      linkedin: "https://www.linkedin.com/in/trique-nguyen/",
      github: "https://github.com/triquenguyen",
      info: "B.S. in Software Engineering at San Jose State University",
      photo: "/trique.jpg",
    },
    {
      name: "Siddhanth Kumar",
      linkedin: "https://www.linkedin.com/in/siddhanth-kumar-3897b5205/",
      github: "https://github.com/sidgithub780",
      info: "Incoming B.S. in Computer Science at Purdue University",
      photo: "/sid.jpg",
    },
  ];

  return (
    <div className={`bg-black min-h-screen px-10 py-2 ${montserrat.className}`}>
      <section className=" w-full flex flex-col justify-center items-center text-center cursor-default">
        <div className="text-white flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 2,
              delay: 0,
              ease: [0, 0.71, 0.2, 1.01],
            }}
            className="font-bold text-[48px] text-white"
          >
            About Us
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 2,
              delay: 0.5,
              ease: [0, 0.71, 0.2, 1.01],
            }}
            className="mt-[1rem]"
          >
            We are thriving students with a passion for developing tools to help
            the world!
          </motion.div>

          <div className="flex flex-wrap justify-center w-[100%] gap-10 mt-[4rem]">
            {contacts.map((contact, index) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 1,
                  delay: 1 + index * 0.5, // This is insane big brain math for the staggered animations
                  ease: [0, 0.71, 0.2, 1.01],
                }}
                key={index}
              >
                <Contributor
                  name={contact.name}
                  linkedin={contact.linkedin}
                  github={contact.github}
                  info={contact.info}
                  photo={contact.photo}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
