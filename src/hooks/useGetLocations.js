import { supabase } from "../../utils/supabase";
import { useState, useEffect } from "react";

export default function useGetLocations() {
    const [locations, setLocations] = useState([]);

    useEffect(() => {
        supabase.from("localizaciones").select("*").neq("deleted", true).then((result) => {
            if (result.error) {
                console.error(result.error);
            } else {
                const data = result.data || [];
                // Sort locations depending on their number of trips in descending order
                const sortedData = [...data].sort((a, b) => (b.num_trips || 0) - (a.num_trips || 0));
                setLocations(sortedData);
            }
        });
    }, []);

    return { locations };
}