import { Box } from "@mui/material";
import * as d3 from "d3";
import { useRef, useEffect } from "react";
import libraryData from "./22-23libraryData.json";
import styling from "./svg.css";


//Line plot of year to number of tickets
export function MostCheckedOutBooksBarChart() {

    const ref = useRef();

    const margin = { top: 0, right: 0, bottom: 0, left: 50 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    useEffect(() => {
        const svgElement = d3.select(ref.current);

        // append the svg object to the body of the page
        svgElement
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");


        const bookToData = {};

        libraryData.forEach((entry) => {
            if (bookToData[entry.bib_id]) {
                bookToData[entry.bib_id].push(entry);
            } else {
                bookToData[entry.bib_id] = [entry];
            }
        });

        let bookToDataArr = [];

        Object.keys(bookToData).forEach((book) => {
            bookToDataArr.push({book: bookToData[book][0], numCheckedOut: bookToData[book].length});
        });

        bookToDataArr.forEach((item) => {
            item.book.bib_title = item.book.bib_title.split("|")[0];
            if (item.book.bib_title.includes("/")) {
                item.book.bib_title = item.book.bib_title.substring(0, item.book.bib_title.length - 2)
            }

            item.book.bib_subtitle = item.book.bib_subtitle.split("|")[0];
            if (item.book.bib_subtitle.includes("/")) {
                item.book.bib_subtitle = item.book.bib_subtitle.substring(0, item.book.bib_subtitle.length - 2)
            }
        });

        bookToDataArr = bookToDataArr
        .toSorted((a, b) => b.numCheckedOut - a.numCheckedOut)
        .filter((item) => item.book.item_type == "RES2HR")
        .slice(0, 20);

        console.log(bookToDataArr);

        const x = d3.scaleBand()
            .range([0, width])
            .domain(bookToDataArr.map((obj) => obj.book.bib_title + " " + obj.book.bib_subtitle))
            .padding(0.2);

        svgElement.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

        // Add Y axis
        const y = d3.scaleLinear()
            .domain([0, d3.max(bookToDataArr, d => d.numCheckedOut)])
            .range([height, 0]);

        svgElement.append("g")
            .call(d3.axisLeft(y));

        // Bars 
        svgElement.selectAll("mybar")
            .data(bookToDataArr)
            .enter()
            .append("rect")
            .attr("x", d => x(d.book.bib_title + " " + d.book.bib_subtitle))
            .attr("y", d => y(d.numCheckedOut))
            .attr("width", x.bandwidth())
            .attr("height", d => height - y(d.numCheckedOut))
            .attr("fill", "lightcoral")
            //try coloring by genre instead?
    });

    return (
        <Box sx={{ mt: 3, ml: 40 }}>
            <svg ref={ref} width={width} height={height} className="noOverflow" />
        </Box>
    );

}