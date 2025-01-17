import React, { useState, useEffect } from "react";

import CommonSection from "../components/ui/Common-section/CommonSection";

import NftCard from "../components/ui/Nft-card/NftCard";

import { Container, Row, Col } from "reactstrap";

import "../styles/market.css";

const Market = ({ NFTMarketplace }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListedItems = async () => {
      try {
        setLoading(true);

        // Fetch all listed items from the marketplace contract
        const listedItems = await NFTMarketplace .getAllListedItems();

        // Map the listed items to a format suitable for the UI
        const items = await Promise.all(
          listedItems.map(async (item) => {
            const tokenURI = await NFTMarketplace.getTokenURI(item.tokenId);
            const response = await fetch(tokenURI);
            const metadata = await response.json();

            return {
              id: item.tokenId,
              name: metadata.name,
              image: metadata.image,
              currentBid: parseFloat(item.price) / 1e18, // Convert price from Wei to ETH
              seller: item.seller,
            };
          })
        );

        setData(items);
      } catch (error) {
        console.error("Error fetching listed items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchListedItems();
  }, [NFTMarketplace]);

  const handleCategory = () => {
    // Implement category filtering logic here
  };

  const handleItems = () => {
    // Implement item type filtering logic here
  };

  // ====== SORTING DATA BY HIGH, MID, LOW RATE =========
  const handleSort = (e) => {
    const filterValue = e.target.value;

    if (filterValue === "high") {
      const filterData = [...data].sort((a, b) => b.currentBid - a.currentBid);
      setData(filterData);
    }

    if (filterValue === "mid") {
      const filterData = data.filter(
        (item) => item.currentBid >= 5.5 && item.currentBid < 6
      );
      setData(filterData);
    }

    if (filterValue === "low") {
      const filterData = data.filter(
        (item) => item.currentBid >= 4.89 && item.currentBid < 5.5
      );
      setData(filterData);
    }
  };

  if (loading) {
    return <div>Loading marketplace items...</div>;
  }

  return (
    <>
      <CommonSection title={"MarketPlace"} />

      <section>
        <Container>
          <Row>
            <Col lg="12" className="mb-5">
              <div className="market__product__filter d-flex align-items-center justify-content-between">
                <div className="filter__left d-flex align-items-center gap-5">
                  <div className="all__category__filter">
                    <select onChange={handleCategory}>
                      <option>All Categories</option>
                      <option value="art">Art</option>
                      <option value="music">Music</option>
                      <option value="domain-name">Domain Name</option>
                      <option value="virtual-world">Virtual World</option>
                      <option value="trending-card">Trending Cards</option>
                    </select>
                  </div>

                  <div className="all__items__filter">
                    <select onChange={handleItems}>
                      <option>All Items</option>
                      <option value="single-item">Single Item</option>
                      <option value="bundle">Bundle</option>
                    </select>
                  </div>
                </div>

                <div className="filter__right">
                  <select onChange={handleSort}>
                    <option>Sort By</option>
                    <option value="high">High Rate</option>
                    <option value="mid">Mid Rate</option>
                    <option value="low">Low Rate</option>
                  </select>
                </div>
              </div>
            </Col>

            {data?.map((item) => (
              <Col lg="3" md="4" sm="6" className="mb-4" key={item.id}>
                <NftCard item={item} />
              </Col>
            ))}
          </Row>
        </Container>
      </section>
    </>
  );
};

export default Market;