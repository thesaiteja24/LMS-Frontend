import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
// import Swal from "sweetalert2";

const UniqueBatchesContext = createContext();

export const UniqueBatchesProvider = ({ children }) => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Memoized fetch function
  const fetchBatches = useCallback(async (location) => {
    if (batches.length > 0) return; // Prevent unnecessary fetches
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/batches`, {
        params: { location }, 
      });
      setBatches(response.data.data);
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false);
    }
  }, [ batches.length]); // Memoized with location but prevents extra calls

  useEffect(() => {
    if (batches.length > 0) fetchBatches();
  }, [fetchBatches, batches.length]);

  return (
    <UniqueBatchesContext.Provider value={{ batches, loading, fetchBatches  }}>
      {children}
    </UniqueBatchesContext.Provider>
  );
};

export const useUniqueBatches = () => useContext(UniqueBatchesContext);
