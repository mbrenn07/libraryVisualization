import { Box } from "@mui/material";
import * as d3 from "d3";
import { useRef, useEffect } from "react";
import libraryData from "./22-23libraryData.json";
import styling from "./svg.css";
import surgeTimeKey from "./surgeTimeKey.png"


//Line plot of year to number of tickets
export function SurgeTimeGraph() {

    const ref = useRef();

    const margin = { top: 0, right: 0, bottom: 0, left: 0 };
    const width = window.innerWidth - 250 - margin.left - margin.right;
    const height = window.innerHeight - 120 - margin.top - margin.bottom;

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


        const formattedLibraryData = {};

        const addToLibraryData = (dateObj, itemType, entryType) => {
            if (dateObj.toString() === "Invalid Date") {
                return;
            }

            const date = dateObj.toISOString().substring(0, 10);
            if (formattedLibraryData[date]) {
                if (formattedLibraryData[date][entryType]) {
                    formattedLibraryData[date][entryType].total = formattedLibraryData[date][entryType].total + 1;
                    formattedLibraryData[date][entryType][itemType] = formattedLibraryData[date][entryType][itemType] + 1;
                } else {
                    formattedLibraryData[date][entryType] = { total: 1, [itemType]: 1 };
                }
            } else {
                formattedLibraryData[date] = { [entryType]: { total: 1, [itemType]: 1 } };
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

        let currNetBooks = 0;
        let formattedLibraryDataArr = [];

        Object.keys(formattedLibraryData).sort((a, b) => new Date(a).getTime() - new Date(b).getTime()).forEach((key) => {
            currNetBooks = currNetBooks + (formattedLibraryData[key].checkout?.total ?? 0) - (formattedLibraryData[key].return?.total ?? 0);
            formattedLibraryData[key].netLoanedBooks = currNetBooks;
            formattedLibraryData[key].date = new Date(key);
            formattedLibraryDataArr.push(formattedLibraryData[key]);
        })

        console.log(formattedLibraryDataArr);

        formattedLibraryDataArr = formattedLibraryDataArr.slice(0, 355);

        // Add X axis --> it is a date format
        const x = d3.scaleTime()
            .domain(d3.extent(formattedLibraryDataArr.map((d) => d.date)))
            .range([0, width]);

        svgElement.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .attr("class", "axisColor")
            .style("font-size", "1.5em");

        // Add Y axis
        const y = d3.scaleLinear()
            .domain([0, d3.max(formattedLibraryDataArr.map((d) => d.netLoanedBooks))])
            .range([height, 0]);

        const yCheckouts = d3.scaleLinear()
            .domain([0, d3.max(formattedLibraryDataArr.map((d) => d.checkout?.total)) * 1.5])
            .range([height, 0]);

        //checkout bars
        svgElement.selectAll("bar")
            .data(formattedLibraryDataArr.filter((d) => d.checkout))
            .enter()
            .append("rect")
            .attr("x", d => x(new Date(d.date)))
            .attr("y", d => yCheckouts(d.checkout.total))
            .attr("width", width / formattedLibraryDataArr.length)
            .attr("height", d => height - yCheckouts(d.checkout.total))
            .attr("fill", "#B0C5A4");

        //return bars
        svgElement.selectAll("bar")
            .data(formattedLibraryDataArr.filter((d) => d.return))
            .enter()
            .append("rect")
            .attr("x", d => x(new Date(d.date)))
            .attr("y", d => yCheckouts(d.return.total))
            .attr("width", (width / formattedLibraryDataArr.length) / 2)
            .attr("height", d => height - yCheckouts(d.return.total))
            .attr("fill", "#D37676");

        //renew bars
        svgElement.selectAll("bar")
            .data(formattedLibraryDataArr.filter((d) => d.renewal))
            .enter()
            .append("rect")
            .attr("x", d => x(new Date(d.date)))
            .attr("y", d => yCheckouts(d.renewal.total))
            .attr("width", (width / formattedLibraryDataArr.length) / 4)
            .attr("height", d => height - yCheckouts(d.renewal.total))
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
            .text("Books Currently Checked Out");

        svgElement.append("text")
            .attr("text-anchor", "middle")
            .attr('transform', 'rotate(-90)')
            .attr("font-family", "Roboto")
            .attr("font-size", "2em")
            .attr("x", (-height / 2))
            .attr("y", width + 90)
            .text("Checkouts, Returns, and Renewals");

        svgElement.append("text")
            .attr("text-anchor", "middle")
            .attr("font-size", "3.5em")
            .attr("font-weight", 700)
            .attr("font-family", "Roboto")
            .attr("text-decoration", "underline")
            .attr("x", width * .22)
            .attr("y", height * .12)
            .text("VT Library Surge Dates");
    });

    return (
        <Box sx={{ mt: 3, ml: 10 }}>
            <svg ref={ref} width={width} height={height} className="noOverflow" />
            <Box sx={{position: "absolute", top: "60%", left: "83%", transform: "translate(-50%, -50%)"}}>
                <img src={surgeTimeKey} style={{width: "15vw"}} alt="Checkouts are green, Returns are red, Renewals are yellow"/>
            </Box>
        </Box>
    );

}