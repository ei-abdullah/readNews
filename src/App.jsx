import { useEffect, useRef, useState } from "react";
import useKey from "./useKey";

const API_KEY = "GET YOUR API KEY FROM https://newsapi.org/";

function ToggleComponent({ toggleBookmark, setToggleBookmark }) {
  return (
    <label className="inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        value={toggleBookmark}
        className="sr-only peer"
        onChange={() => {
          setToggleBookmark((toggle) => !toggle);
          console.log(toggleBookmark);
        }}
      />
      <div className="relative w-11 h-6 bg-paleChestnut border-paleChestnut peer-focus:outline-none peer-focus:ring-4  rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-paleChestnut after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white  after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-paleChestnut"></div>
      <span className="ms-3 text-sm font-medium text-charcoal">
        Toggle Bookmarked
      </span>
    </label>
  );
}

function SelectInputComponent({ option, setOption }) {
  return (
    <div className="max-w-sm mx-auto">
      <select
        id="countries"
        value={option}
        onChange={(e) => {
          setOption(e.target.value);
        }}
        className="bg-paleChestnut border-bg-paleChestnut text-charcoal text-sm rounded-lg focus:ring-lightGray  focus:ring-lightGrayblock w-full p-2.5 "
      >
        <option value="">Choose a topic</option>
        <option value="business">Business</option>
        <option value="entertainment">Entertainment</option>
        <option value="sports">Sports</option>
        <option value="technology">Technology</option>
      </select>
    </div>
  );
}

export default function App() {
  const [query, setQuery] = useState("");
  const [queryNews, setQueryNews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  //* For Bookmarked Articles
  const [bookmarked, setBookmarked] = useState([]);
  function handleBookmarked(article) {
    setBookmarked((bookmarked) => [...bookmarked, article]);
  }

  const [toggleBookmark, setToggleBookmark] = useState(false);

  //* For Headlines
  const [option, setOption] = useState("");

  useEffect(
    function () {
      const controller = new AbortController();

      const today = new Date();
      const pastDate = new Date(today);
      pastDate.setDate(today.getDate() - 1);
      const formattedDate = pastDate.toISOString().split("T")[0];

      async function getNewsFromQuery() {
        try {
          setIsLoading(true);
          setError("");
          const res = await fetch(
            `https://newsapi.org/v2/everything?q=${query}&from=${formattedDate}&sortBy=popularity&language=en&apiKey=${API_KEY}`,
            { signal: controller.signal }
          );
          if (res.status === "error")
            throw new Error("Error while fetching articles");
          const data = await res.json();
          if (res.totalResults === 0) throw new Error("No article found");
          setQueryNews(data.articles);
        } catch (error) {
          if (error.name !== "AbortError") setError(error.message);
          setError("");
        } finally {
          setIsLoading(false);
        }
      }
      if (query.length < 3) {
        setQueryNews([]);
        setError("");
        return;
      }
      getNewsFromQuery();
    },
    [query]
  );

  return (
    <div className="bg-lightGray h-auto">
      <NavBar>
        <Logo />
        <Search query={query} setQuery={setQuery} />
      </NavBar>
      <hr className="w-5/6 m-auto text-center border-2 bg- border-paleChestnut " />
      <div className="flex justify-evenly items-end pt-10">
        <div className="text-center">
          <ToggleComponent
            toggleBookmark={toggleBookmark}
            setToggleBookmark={setToggleBookmark}
          />
        </div>
        <div>
          <SelectInputComponent option={option} setOption={setOption} />
        </div>
      </div>
      <Main>
        <Box>
          {isLoading && <Loader />}
          {error && <Error message={error} />}
          {!isLoading &&
            !error &&
            (toggleBookmark ? (
              //? Display Bookmark Results
              <BookmarkResults bookmarked={bookmarked} />
            ) : (
              //? Display Query Results
              <QueryResults
                queryNews={queryNews}
                bookmarked={bookmarked}
                onBookmark={handleBookmarked}
              />
            ))}
        </Box>

        <Box>
          <Headlines option={option} />
        </Box>
      </Main>
    </div>
  );
}

function Main({ children }) {
  return <div className="flex gap-12 justify-center py-10">{children}</div>;
}

function NavBar({ children }) {
  return (
    <nav className="px-8 py-12 grid items-center grid-cols-2 ">{children}</nav>
  );
}

function Logo() {
  return (
    <h1 className="font-bold text-4xl font-dmSerif text-charcoal">
      readNews 📰
    </h1>
  );
}

function Search({ query, setQuery }) {
  //* It will focus the search bar on mount
  const inputEl = useRef(null);

  useEffect(function () {
    inputEl.current.focus();
  }, []);

  useKey("Enter", () => {
    // Immediately return if it is already active
    if (document.activeElement === inputEl.current) return;

    inputEl.current.focus();
    setQuery("");
  });

  return (
    <div className="text-right">
      <input
        placeholder="Search for keywords..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="py-2 px-4 w-72 text-center outline-none border-2 border-paleChestnut rounded-lg text-charcoal font-semibold bg-paleChestnut placeholder-charcoal focus:shadow-xl placeholder:font-thin transition-all"
        ref={inputEl}
      />
    </div>
  );
}

function Loader() {
  return (
    <div className="grid place-items-center h-full m-auto">
      <div className="loader-container"></div>
    </div>
  );
}

function Error({ message }) {
  return (
    <div className="grid place-items-center h-full m-auto">
      <span>⛔</span> {message}
    </div>
  );
}

function Box({ children }) {
  return (
    <div className="h-boxHeight w-2/5 bg-paleChestnut rounded-lg relative shadow-lg overflow-auto scrollbar-hidden">
      {children}
    </div>
  );
}

function QueryResults({ queryNews, bookmarked, onBookmark }) {
  return queryNews?.map((news, idx) => (
    <ResultsTag
      news={news}
      key={idx}
      bookmarked={bookmarked}
      onBookmark={onBookmark}
    />
  ));
}

function ResultsTag({ news, bookmarked, onBookmark }) {
  if (news.urlToImage == null) return;

  const {
    urlToImage,
    title,
    description,
    url,
    author,
    source: { name },
  } = news;

  function handleAdd() {
    const bookmarkedArticles = {
      urlToImage,
      title,
      description,
      url,
      author,
      name,
    };

    onBookmark(bookmarkedArticles);
    console.log(bookmarked);
  }

  return (
    <div className="flex gap-2 bg-lightGray my-2 h-72 relative">
      <div className="relative overflow-hidden w-72 h-72">
        <img
          className="w-full h-full object-cover"
          src={urlToImage}
          alt={title}
        />
      </div>

      <div className="w-3/4 h-full px-4 flex flex-col justify-evenly ">
        <div className="font-bold text-lg text-darkGray justify-self-start">
          {title}
        </div>
        <div>
          <div className="text-charcoal">{description}</div>
          <div>
            <a
              href={url}
              target="blank"
              className="text-charcoal hover:text-paleChestnut transition-all font-semibold"
            >
              read more
            </a>
          </div>

          <div className="flex justify-between pt-2 font-semibold text-darkGray">
            <div>{author}</div>
            <div>{name}</div>
          </div>
        </div>
      </div>
      <button onClick={handleAdd} className="absolute bottom-2 right-2">
        <SetBookmark />
      </button>
    </div>
  );
}

function SetBookmark() {
  const [isBookmarked, setIsBookmarked] = useState(false);
  function handleIsBookmarked() {
    setIsBookmarked((set) => !set);
  }
  return (
    <div
      onClick={handleIsBookmarked}
      className={`${
        isBookmarked ? "opacity-100" : "opacity-20"
      } z-10 bg-paleChestnut w-10 h-10 rounded-full grid place-items-center  hover:opacity-100 transition-all`}
    >
      <img
        className="w-4 h-4"
        src="../bookmark-solid.svg"
        alt="bookmark-solid"
      />
    </div>
  );
}

function Headlines({ option }) {
  const [headlines, setHeadlines] = useState([]);

  useEffect(
    function () {
      async function getHeadlines() {
        if (option === "") return;
        const res = await fetch(
          `https://newsapi.org/v2/top-headlines?country=us&category=${option}&apiKey=${API_KEY}`
        );
        if (res.status === "error")
          throw new Error("Error while fetching headlines");
        const data = await res.json();
        if (res.totalResults === 0) throw new Error("No Headlines found");
        setHeadlines(data.articles);
      }
      if (option === "") {
        setHeadlines([]);
      }
      getHeadlines();
    },
    [option]
  );

  return headlines?.map((news, idx) => <HeadlinesTag news={news} key={idx} />);
}

function HeadlinesTag({ news }) {
  return (
    <div className="flex flex-col justify-evenly gap-2 bg-lightGray my-2 h-72">
      <div className="font-bold text-2xl text-darkGray justify-self-start px-12">
        {news.title}
      </div>
      <div className="px-12">
        <a
          href={news.url}
          target="blank"
          className="text-charcoal hover:text-paleChestnut transition-all font-semibold"
        >
          read more
        </a>
      </div>
      <div className="flex justify-between pt-2 font-semibold text-darkGray px-12">
        <div>{news.author}</div>
        <div>{news.source.name}</div>
      </div>
    </div>
  );
}

function BookmarkResults({ bookmarked }) {
  return bookmarked?.map((article, idx) => (
    <BookmarkTag article={article} key={idx} />
  ));
}

function BookmarkTag({ article }) {
  if (article.urlToImage == null) return;

  const { urlToImage, title, description, url, author, name } = article;

  return (
    <div className="flex gap-2 bg-lightGray my-2 h-72">
      <div className="relative overflow-hidden w-72 h-72">
        <img
          className="w-full h-full object-cover"
          src={urlToImage}
          alt={title}
        />
      </div>

      <div className="w-3/4 h-full px-4 flex flex-col justify-evenly ">
        <div className="font-bold text-lg text-darkGray justify-self-start">
          {title}
        </div>
        <div>
          <div className="text-charcoal">{description}</div>
          <div>
            <a
              href={url}
              target="blank"
              className="text-charcoal hover:text-paleChestnut transition-all font-semibold"
            >
              read more
            </a>
          </div>

          <div className="flex justify-between pt-2 font-semibold text-darkGray">
            <div>{author}</div>
            <div>{name}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
