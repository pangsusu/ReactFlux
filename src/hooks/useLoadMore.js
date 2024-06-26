import { useContext, useState } from "react";

import ContentContext from "../components/Content/ContentContext";
import { filterEntries } from "../utils/Filter";

const useLoadMore = () => {
  const {
    entries,
    filterStatus,
    filterString,
    filterType,
    offset,
    setEntries,
    setFilteredEntries,
    setLoadMoreUnreadVisible,
    setLoadMoreVisible,
    setOffset,
    total,
    unreadCount,
  } = useContext(ContentContext);

  /* 加载更多 loading*/
  const [loadingMore, setLoadingMore] = useState(false);

  const getFirstImage = (entry) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(entry.content, "text/html");
    const firstImg = doc.querySelector("img");
    if (firstImg) {
      entry.imgSrc = firstImg.getAttribute("src");
    }
    return entry;
  };

  const handleLoadMore = async (getEntries) => {
    setLoadingMore(true);

    try {
      const response = await getEntries(offset + 100);
      if (response?.data?.entries) {
        setOffset(offset + 100);
        const newArticlesWithImage = response.data.entries.map(getFirstImage);
        const updatedAllArticles = [
          ...new Map(
            [...entries, ...newArticlesWithImage].map((entry) => [
              entry.id,
              entry,
            ]),
          ).values(),
        ];
        setEntries(updatedAllArticles);

        const filteredArticles =
          filterStatus === "all"
            ? updatedAllArticles
            : updatedAllArticles.filter((a) => a.status === "unread");

        const filteredByString = filterString
          ? filterEntries(
              filteredArticles,
              filterType,
              filterStatus,
              filterString,
            )
          : filteredArticles;

        setFilteredEntries(filteredByString);
        setLoadMoreVisible(updatedAllArticles.length < total);
        setLoadMoreUnreadVisible(
          filteredArticles.length < unreadCount && filterStatus === "unread",
        );
      }
    } catch (error) {
      console.error("Error fetching more articles:", error);
    }

    setLoadingMore(false);
  };

  return { getFirstImage, handleLoadMore, loadingMore };
};

export default useLoadMore;
