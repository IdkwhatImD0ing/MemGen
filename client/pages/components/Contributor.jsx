import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const Contributor = ({ photo, name, info, linkedin, github, gmail }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="xl:w-[40rem] w-[20rem] h-auto text-[16px] flex flex-col xl:flex-row bg-slate-700 rounded-xl shadow-lg cursor-default"
    >
      <Image
        className="xl:w-[30%] w-full auto rounded-xl object-cover"
        src={photo}
        alt="contact-image"
        width={1000}
        height={1000}
      />
      <div className="flex flex-col justify-between px-6 py-3 text-left">
        <figcaption className="flex flex-col gap-2">
          <div className="text-left font-bold text-[20px]">{name}</div>
          <div className="">{info}</div>
        </figcaption>
        <div className="flex gap-2 items-center mt-4">
          <motion.a
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            href={linkedin}
            target="_blank"
            rel="noreferrer"
          >
            <Image
              className="w-[24px] hover:ring-grey"
              src="/linkedin.png"
              alt="linkedin-image"
              width={20}
              height={20}
            />
          </motion.a>
          <motion.a
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            href={github}
            target="_blank"
            rel="noreferrer"
          >
            <Image
              className="w-[24px]"
              src="/github.png"
              alt="github-image"
              width={20}
              height={20}
            />
          </motion.a>
        </div>
      </div>
    </motion.div>
  );
};

export default Contributor;
