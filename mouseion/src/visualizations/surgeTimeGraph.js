import { Box, Typography } from "@mui/material";
import * as d3 from "d3";
import { useRef, useEffect, useState, useLayoutEffect } from "react";
import libraryData from "./22-23libraryData.json";
import styling from "./svg.css";
import surgeTimeKey from "./surgeTimeKey.png"



//Line plot of year to number of tickets
export function SurgeTimeGraph() {

    const ref = useRef();
    const legendRef = useRef();

    const [size, setSize] = useState([window.innerWidth, window.innerHeight]);
    useLayoutEffect(() => {
      function updateSize() {
        setSize([window.innerWidth, window.innerHeight]);
      }
      window.addEventListener('resize', updateSize);
      updateSize();
      return () => window.removeEventListener('resize', updateSize);
    }, []);

    const margin = { top: 0, right: 0, bottom: 0, left: 0 };
    const width = size[0] - 250 - margin.left - margin.right;
    const height = size[1] - 120 - margin.top - margin.bottom;

    const formattedLibraryData = {};
    const itemTypes = {};

    const addToLibraryData = (dateObj, itemType, entryType) => {
        if (dateObj.toString() === "Invalid Date") {
            return;
        }

        const date = dateObj.toISOString().substring(0, 10);
        if (formattedLibraryData[date]) {
            if (formattedLibraryData[date][entryType]) {
                formattedLibraryData[date][entryType].total = formattedLibraryData[date][entryType].total + 1;
                if (formattedLibraryData[date][entryType][itemType]) {
                    formattedLibraryData[date][entryType][itemType] = formattedLibraryData[date][entryType][itemType] + 1;
                } else {
                    formattedLibraryData[date][entryType][itemType] = 1;
                }
            } else {
                formattedLibraryData[date][entryType] = { total: 1, [itemType]: 1 };
            }
        } else {
            formattedLibraryData[date] = { [entryType]: { total: 1, [itemType]: 1 } };
        }

        if (itemTypes[itemType]) {
            itemTypes[itemType] = itemTypes[itemType] + 1;
        } else {
            itemTypes[itemType] = 1;
        }

    }

    libraryData.forEach((entry) => {
        const checkoutDate = new Date(entry.loan_date);
        addToLibraryData(checkoutDate, entry.item_type, "checkout");
        const returnDate = new Date(entry.loan_return_date);
        addToLibraryData(returnDate, entry.item_type, "return");
        const renewDate = new Date(entry.loan_last_renewed_date);
        addToLibraryData(renewDate, entry.item_type, "renewal");

    });

    const [currKey, setCurrKey] = useState("total");

    const keys = ["TOTAL"];
    let other = { keys: [], total: 0 };
    Object.keys(itemTypes).sort((a, b) => itemTypes[b] - itemTypes[a]).forEach((key) => {
        // if (itemTypes[key] > 50) {
        //     keys.push(key);
        // } else {
        //     other.total = other.total + itemTypes[key];
        //     other.keys.push(key);
        // }
            keys.push(key);
    });

    // if (other.total > 0) {
    //     keys.push("OTHER");
    // }

    useEffect(() => {
        let currNetBooks = 0;
        let formattedLibraryDataArr = [];
    
        Object.keys(formattedLibraryData).sort((a, b) => new Date(a).getTime() - new Date(b).getTime()).forEach((key) => {
            currNetBooks = currNetBooks + (formattedLibraryData[key].checkout?.[currKey] ?? 0) - (formattedLibraryData[key].return?.[currKey] ?? 0);
            formattedLibraryData[key].netLoanedBooks = currNetBooks;
            formattedLibraryData[key].date = new Date(key);
            formattedLibraryDataArr.push(formattedLibraryData[key]);
        })
    
        formattedLibraryDataArr = formattedLibraryDataArr.slice(0, 355);

        let svgElement = d3.select(ref.current);
        const legendElement = d3.select(legendRef.current);

        svgElement.selectAll("*").remove();

        // append the svg object to the body of the page
        svgElement
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        // Add X axis --> it is a date format
        const x = d3.scaleTime()
            .domain(d3.extent(formattedLibraryDataArr.map((d) => d.date)))
            .range([0, width]);

        svgElement.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .attr("class", "axisColor")
            .style("font-size", "1.3vw");

        // Add Y axis
        const y = d3.scaleLinear()
            .domain([0, d3.max(formattedLibraryDataArr.map((d) => d.netLoanedBooks))])
            .range([height, 0]);

        const yCheckouts = d3.scaleLinear()
            .domain([0, d3.max(formattedLibraryDataArr.map((d) => d.checkout?.[currKey])) * 1.5])
            .range([height, 0]);

        //checkout bars
        svgElement.selectAll("bar")
            .data(formattedLibraryDataArr.filter((d) => d.checkout))
            .enter()
            .append("rect")
            .attr("x", d => x(new Date(d.date)))
            .attr("y", d => yCheckouts(d.checkout[currKey]))
            .attr("width", width / formattedLibraryDataArr.length)
            .attr("height", d => height - yCheckouts(d.checkout[currKey]))
            .attr("fill", "#B0C5A4");

        //return bars
        svgElement.selectAll("bar")
            .data(formattedLibraryDataArr.filter((d) => d.return))
            .enter()
            .append("rect")
            .attr("x", d => x(new Date(d.date)))
            .attr("y", d => yCheckouts(d.return[currKey]))
            .attr("width", (width / formattedLibraryDataArr.length) / 2)
            .attr("height", d => height - yCheckouts(d.return[currKey]))
            .attr("fill", "#D37676");

        //renew bars
        svgElement.selectAll("bar")
            .data(formattedLibraryDataArr.filter((d) => d.renewal))
            .enter()
            .append("rect")
            .attr("x", d => x(new Date(d.date)))
            .attr("y", d => yCheckouts(d.renewal[currKey]))
            .attr("width", (width / formattedLibraryDataArr.length) / 4)
            .attr("height", d => height - yCheckouts(d.renewal[currKey]))
            .attr("fill", "#F1EF99");

        // Add the line
        svgElement.append("path")
            .datum(formattedLibraryDataArr)
            .attr("fill", "none")
            .attr("stroke", "#008DDA")
            .attr("stroke-width", 5)
            .attr("d", d3.line()
                .x((d) => x(new Date(d.date)))
                .y((d) => y(d.netLoanedBooks))
            );

        svgElement.append("g")
            .call(d3.axisLeft(y))
            .attr("class", "axisColor")
            .style("font-size", "1.5em");

        svgElement.append("g")
            .call(d3.axisRight(yCheckouts))
            .attr("class", "axisColor")
            .attr("transform", "translate(" + (width + 1) + ",0)")
            .style("font-size", "1.5em");


        svgElement.append("text")
            .attr("text-anchor", "middle")
            .attr("font-family", "Roboto")
            .attr("font-size", "2em")
            .attr("x", width / 2)
            .attr("y", height + 70)
            .text("2023 - 2024 School Year");

        svgElement.append("text")
            .attr("text-anchor", "middle")
            .attr('transform', 'rotate(-90)')
            .attr("font-family", "Roboto")
            .attr("font-size", "2em")
            .attr("x", (-height / 2))
            .attr("y", -95)
            .text("Items Currently Checked Out");

        svgElement.append("text")
            .attr("text-anchor", "middle")
            .attr('transform', 'rotate(-90)')
            .attr("font-family", "Roboto")
            .attr("font-size", "2em")
            .attr("x", (-height / 2))
            .attr("y", width + 90)
            .text("Checkouts, Returns, and Renewals");

        //creating the legend

        const onTypeSelected = (type) => {
            if (type === "OTHER") {
                return;
            }

            if (type === "TOTAL" ) {
                setCurrKey("total");
                return;
            }

            setCurrKey(type);
        }

        // Add one dot in the legend for each name.
        legendElement.selectAll("mydots")
            .data(keys)
            .enter()
            .append("circle")
            .attr("cx", 10)
            .attr("cy", function (d, i) { return 15 + i * 25 }) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("r", 7)
            .style("fill", (d) => {
                return d === currKey.toUpperCase() ? "#008DDA" : "#000000"
            })
            .style("stroke", (d) => {
                return d === currKey.toUpperCase() ? "#008DDA" : "#000000"
            })
            .attr("shape-rendering", "geometricPrecision")
            .on('click', function (d, i) { onTypeSelected(i) });

        // Add one dot in the legend for each name.
        legendElement.selectAll("mylabels")
            .data(keys)
            .enter()
            .append("text")
            .attr("x", 25)
            .attr("y", function (d, i) { return 15 + i * 25 }) // 100 is where the first dot appears. 25 is the distance between dots
            .style("fill", (d) => d === currKey.toUpperCase() ? "#008DDA" : "#000000" )
            .text(function (d) { return d })
            .attr("text-anchor", "left")
            .attr("text-rendering", "optimizeLegibility")
            .style("alignment-baseline", "middle")
            .on('click', function (d, i) { onTypeSelected(i) });

        legendRef.current.setAttribute("height", keys.length * 25);
    }, [currKey, width, height]);


    return (
        <Box sx={{ mt: 3, ml: 10 }}>
            <svg ref={ref} width={width} height={height} className="noOverflow" />
            <Box sx={{ position: "absolute", top: "0%", left: "100%", transform: "translate(-305px, 30px)", overflow: "auto", height: 300, border: "2px solid black", opacity: .4 }} className="legend">
                <svg ref={legendRef} width={150} />
            </Box>

        </Box>
    );

}