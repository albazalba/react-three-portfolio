import { ExperienceType } from "../types/experience";

// Experience data from the resume
const experiences: ExperienceType[] = [
  // {
  //   id: 1,
  //   company: "Evolvex Technologies",
  //   position: "Frontend Developer Lead",
  //   period: "Dec 2024 - Present",
  //   location: "Dubai, United Arab Emirates",
  //   responsibilities: [
  //     "Spearheaded the development of an advanced dashboard using React, Redux Toolkit, and Ant Design.",
  //     "Implemented drag-and-drop plugins and optimized user interactions while maintaining state consistency and performance.",
  //     "Integrated React DnD Kit for drag-and-drop functionality, enhancing user interactivity within the dashboard.",
  //     "Implemented code reviews, optimizing code reuses, sprint planning, and feature delivery while ensuring performance and maintainability.",
  //     "Implemented testing standards to handle real-time data updates, ensuring a seamless user experience.",
  //     "Demonstrated leadership by mentoring 6 developers jointly, fostering knowledge sharing, and emphasizing speed and responsiveness across all supported platforms."
  //   ],
  //   technologies: ["React", "Redux Toolkit", "Ant Design", "React DnD Kit"],
  //   color: "blue"
  // },
  {
    id: 2,
    company: "AntStack Technologies (MTS-2)",
    position: "Fullstack Developer",
    period: "May 2021 - Dec 2024",
    location: "Bangalore, India",
    responsibilities: [
      "Developed software using Strapi CMS, Next, React, MongoDB, AWS, and services to build scalable and real-time web applications.",
      "Implemented Redux and Redux Toolkit to manage global state across large-scale applications, optimizing data flow.",
      "Spearheaded the integration of AWS Cognito for application authentication, improving security and supporting over 35,000 user accounts.",
      "Collaborated with cross-function on major projects, leading code walkthroughs and debugging sessions that reduced bug rates by 25%.",
      "Led multiple projects, implementing secure payment solutions and adhering to industry compliance standards.",
      "Implemented test-driven development practices and conducted code reviews for 5+ team members.",
      "Ensured reduced page load times and optimizing complete application state and user effects, ensuring replicable and efficient user experiences.",
      "Developed mobile-first, responsive web applications using React, adhering to best practices in modern UI development.",
    ],
    technologies: ["Next.js", "React", "Redux", "MongoDB", "AWS", "Strapi CMS"],
    color: "purple",
  },
  {
    id: 3,
    company: "AntStack Technologies (MTS-1)",
    position: "Frontend Developer",
    period: "July 2019 - May 2021",
    location: "Bangalore, India",
    responsibilities: [
      "Thrived in a fast-paced startup-like environment at AntStack Technologies, delivering multiple key projects on tight deadlines.",
      "Implemented comprehensive testing framework using Jest, React Testing Library, and Cypress, leading to a 40% reduction in post-deployment bugs.",
      "Utilized Lighthouse for performance audits, optimizing website performance and achieving scores above industry benchmarks.",
      "Implemented performance optimization techniques such as lazy loading, code splitting, and asset optimization, resulting in improved application load times by 30%.",
      "Collaborated closely with designers using Figma to implement visually engaging and responsive user interfaces, ensuring seamless integration with backend services using RESTful APIs and GraphQL.",
    ],
    technologies: [
      "React",
      "Jest",
      "Cypress",
      "Lighthouse",
      "RESTful API",
      "GraphQL",
    ],
    color: "green",
  },
];

export default experiences;
