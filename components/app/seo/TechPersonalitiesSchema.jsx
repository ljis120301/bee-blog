// Tech Personalities Schema - 2025 SEO Enhancement for Topic Authority
export default function TechPersonalitiesSchema() {
  const techPersonalities = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "name": "Linus Torvalds",
        "jobTitle": "Creator of Linux and Git",
        "description": "Software engineer who created the Linux kernel and Git version control system",
        "sameAs": ["https://en.wikipedia.org/wiki/Linus_Torvalds"],
        "knowsAbout": ["Linux", "Git", "Operating Systems", "Open Source"],
        "hasOccupation": {
          "@type": "Occupation",
          "name": "Software Engineer"
        }
      },
      {
        "@type": "Person", 
        "name": "Brendan Eich",
        "jobTitle": "Creator of JavaScript, Mozilla Co-founder",
        "description": "Created JavaScript programming language and co-founded Mozilla",
        "sameAs": ["https://en.wikipedia.org/wiki/Brendan_Eich"],
        "knowsAbout": ["JavaScript", "Web Development", "Programming Languages", "Mozilla"],
        "hasOccupation": {
          "@type": "Occupation",
          "name": "Computer Programmer"
        }
      },
      {
        "@type": "Person",
        "name": "Guido van Rossum", 
        "jobTitle": "Creator of Python Programming Language",
        "description": "Computer programmer who created the Python programming language",
        "sameAs": ["https://en.wikipedia.org/wiki/Guido_van_Rossum"],
        "knowsAbout": ["Python", "Programming Languages", "Software Development"],
        "hasOccupation": {
          "@type": "Occupation", 
          "name": "Computer Programmer"
        }
      },
      {
        "@type": "Person",
        "name": "Marques Brownlee",
        "alternateName": "MKBHD",
        "jobTitle": "Tech Reviewer and YouTuber",
        "description": "Technology reviewer and YouTuber with over 20 million subscribers",
        "sameAs": ["https://en.wikipedia.org/wiki/Marques_Brownlee", "https://www.youtube.com/user/marquesbrownlee"],
        "knowsAbout": ["Technology Reviews", "Consumer Electronics", "Tesla", "Smartphones", "Tech Industry"],
        "hasOccupation": {
          "@type": "Occupation",
          "name": "Technology Journalist"
        }
      },
      {
        "@type": "Person",
        "name": "Austin Evans",
        "jobTitle": "Tech YouTuber and Hardware Reviewer", 
        "description": "Technology YouTuber specializing in computer hardware and consumer electronics reviews",
        "sameAs": ["https://en.wikipedia.org/wiki/Austin_Evans_(YouTuber)", "https://www.youtube.com/user/duncan33303"],
        "knowsAbout": ["Computer Hardware", "Gaming", "Technology Reviews", "Consumer Electronics"],
        "hasOccupation": {
          "@type": "Occupation",
          "name": "Technology Journalist"
        }
      },
      {
        "@type": "Person",
        "name": "Dan Abramov",
        "jobTitle": "React Core Team Member, Redux Creator",
        "description": "Software engineer on React core team at Meta, creator of Redux",
        "sameAs": ["https://github.com/gaearon", "https://twitter.com/dan_abramov"],
        "knowsAbout": ["React", "Redux", "JavaScript", "Frontend Development", "State Management"],
        "hasOccupation": {
          "@type": "Occupation",
          "name": "Software Engineer"
        }
      },
      {
        "@type": "Person",
        "name": "Kent C. Dodds",
        "jobTitle": "JavaScript and React Educator",
        "description": "JavaScript and React educator, testing expert, and course creator",
        "sameAs": ["https://kentcdodds.com", "https://github.com/kentcdodds"],
        "knowsAbout": ["React", "JavaScript", "Testing", "Web Development", "Education"],
        "hasOccupation": {
          "@type": "Occupation",
          "name": "Software Developer Educator"
        }
      },
      {
        "@type": "Person",
        "name": "Evan You",
        "jobTitle": "Creator of Vue.js",
        "description": "Software engineer who created the Vue.js JavaScript framework",
        "sameAs": ["https://github.com/yyx990803", "https://twitter.com/youyuxi"],
        "knowsAbout": ["Vue.js", "JavaScript", "Frontend Development", "Open Source"],
        "hasOccupation": {
          "@type": "Occupation",
          "name": "Software Engineer"
        }
      },
      {
        "@type": "Person",
        "name": "Andrew Ng",
        "jobTitle": "AI Researcher, Coursera Co-founder",
        "description": "AI researcher, Stanford professor, and co-founder of Coursera",
        "sameAs": ["https://en.wikipedia.org/wiki/Andrew_Ng", "https://www.andrewng.org"],
        "knowsAbout": ["Machine Learning", "Deep Learning", "AI", "Education", "Stanford"],
        "hasOccupation": {
          "@type": "Occupation",
          "name": "AI Researcher"
        }
      },
      {
        "@type": "Person",
        "name": "Sam Altman",
        "jobTitle": "OpenAI CEO",
        "description": "CEO of OpenAI, former president of Y Combinator",
        "sameAs": ["https://en.wikipedia.org/wiki/Sam_Altman", "https://twitter.com/sama"],
        "knowsAbout": ["AI", "OpenAI", "ChatGPT", "Y Combinator", "Startups"],
        "hasOccupation": {
          "@type": "Occupation",
          "name": "Technology Executive"
        }
      },
      {
        "@type": "Person",
        "name": "Marc Andreessen",
        "jobTitle": "Netscape Co-founder, a16z Co-founder",
        "description": "Co-creator of Mosaic web browser, co-founder of Netscape and Andreessen Horowitz",
        "sameAs": ["https://en.wikipedia.org/wiki/Marc_Andreessen", "https://twitter.com/pmarca"],
        "knowsAbout": ["Web Browsers", "Venture Capital", "Internet", "Technology Investment"],
        "hasOccupation": {
          "@type": "Occupation",
          "name": "Venture Capitalist"
        }
      },
      {
        "@type": "Person",
        "name": "Wes Bos",
        "jobTitle": "JavaScript Educator and Course Creator",
        "description": "Full-stack developer and educator specializing in JavaScript, React, and web development",
        "sameAs": ["https://wesbos.com", "https://github.com/wesbos"],
        "knowsAbout": ["JavaScript", "React", "Node.js", "Web Development", "Education"],
        "hasOccupation": {
          "@type": "Occupation",
          "name": "Software Developer Educator"
        }
      },
      {
        "@type": "Person",
        "name": "Brad Traversy",
        "jobTitle": "Web Development Educator",
        "description": "Web developer and educator, creator of Traversy Media YouTube channel",
        "sameAs": ["https://www.traversymedia.com", "https://github.com/bradtraversy"],
        "knowsAbout": ["Web Development", "JavaScript", "PHP", "Python", "Programming Education"],
        "hasOccupation": {
          "@type": "Occupation",
          "name": "Software Developer Educator"
        }
      },
      {
        "@type": "Person",
        "name": "Kelsey Hightower",
        "jobTitle": "Google Cloud Developer Advocate",
        "description": "Google Cloud Developer Advocate, Kubernetes expert, and open source advocate",
        "sameAs": ["https://github.com/kelseyhightower", "https://twitter.com/kelseyhightower"],
        "knowsAbout": ["Kubernetes", "Cloud Computing", "DevOps", "Container Orchestration"],
        "hasOccupation": {
          "@type": "Occupation",
          "name": "Developer Advocate"
        }
      },
      {
        "@type": "Person",
        "name": "Scott Hanselman",
        "jobTitle": "Microsoft Principal Program Manager",
        "description": "Microsoft Principal Program Manager, podcaster, and web developer",
        "sameAs": ["https://www.hanselman.com", "https://github.com/shanselman"],
        "knowsAbout": ["Microsoft", ".NET", "Web Development", "Podcasting", "Technology"],
        "hasOccupation": {
          "@type": "Occupation",
          "name": "Program Manager"
        }
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(techPersonalities, null, 2) }}
    />
  );
}

export const getTechPersonalityByName = (name) => {
  const personalities = {
    "linus torvalds": "Creator of Linux and Git, revolutionizing open source development",
    "brendan eich": "JavaScript creator and Mozilla co-founder, shaping web development",
    "guido van rossum": "Python programming language creator, enabling accessible programming",
    "marques brownlee": "MKBHD - Premier tech reviewer with 20M+ YouTube subscribers",
    "austin evans": "Popular tech YouTuber specializing in hardware reviews and gaming",
    "dan abramov": "React core team member and Redux creator at Meta",
    "kent c dodds": "JavaScript educator and testing expert, React specialist",
    "evan you": "Vue.js framework creator, frontend development innovator",
    "andrew ng": "AI researcher, Stanford professor, and Coursera co-founder",
    "sam altman": "OpenAI CEO leading ChatGPT and AI development",
    "marc andreessen": "Netscape co-founder and a16z venture capitalist",
    "wes bos": "Full-stack JavaScript educator and course creator",
    "brad traversy": "Web development educator and Traversy Media founder",
    "kelsey hightower": "Google Cloud advocate and Kubernetes expert",
    "scott hanselman": "Microsoft Principal Program Manager and .NET advocate"
  };
  
  return personalities[name.toLowerCase()] || null;
};

export const getTechPersonalityKeywords = () => [
  "tech personalities", "industry leaders", "programming pioneers", "javascript creators",
  "react developers", "vue creators", "python inventors", "linux founders", "git creators",
  "tech reviewers", "youtube tech", "mkbhd", "austin evans", "tech educators",
  "programming teachers", "web development experts", "ai researchers", "machine learning leaders",
  "openai", "chatgpt", "venture capitalists", "tech investors", "google developers",
  "microsoft engineers", "meta developers", "netflix engineers", "tesla engineers",
  "cybersecurity experts", "blockchain developers", "web3 pioneers", "startup founders"
];
