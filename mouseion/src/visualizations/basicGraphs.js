import { Box } from "@mui/material";
import * as d3 from "d3";
import { useRef, useEffect } from "react";
import constructionSpending from "./construction_spending.json";
import styling from "./svg.css";


//Line plot of year to number of tickets
export function MostCheckedOutBooksBarChart() {

    const ref = useRef();

    const margin = { top: 0, right: 0, bottom: 0, left: 50 };
    const width = 600 - margin.left - margin.right;
    const height = (700 - margin.top - margin.bottom) / 2;

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


        const formattedConstructionSpending = [];

        console.log(constructionSpending[0]);

        //educational

        constructionSpending.forEach((item) => {
            formattedConstructionSpending.push({ x: new Date(item.time.year, item.time.month), y: item.annual.combined["religious"], yTotal: item.annual.combined["total construction"] });
        });

        const cpiJan2024 = 308.417;

        formattedConstructionSpending.forEach((spendingItem) => {
            cpi.forEach((cpiYear) => {
                if (cpiYear.Year == spendingItem.x.getFullYear()) {
                    spendingItem.yAdjusted = (cpiJan2024 * spendingItem.y) / cpiYear[Object.keys(cpiYear)[spendingItem.x.getMonth() + 1]];
                    spendingItem.yTotal = (cpiJan2024 * spendingItem.yTotal) / cpiYear[Object.keys(cpiYear)[spendingItem.x.getMonth() + 1]];
                }
            });
        });

        // Add X axis --> it is a date format
        const x = d3.scaleTime()
            .domain([formattedConstructionSpending[0].x, formattedConstructionSpending[formattedConstructionSpending.length - 1].x])
            .range([0, width]);
        svgElement.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .attr("class", "axisColor");

        // Add Y axis
        const y = d3.scaleLinear()
            .domain([0, d3.max(formattedConstructionSpending, (item) => item.yTotal)])
            .range([height, 0]);

        svgElement.append("g")
            .call(d3.axisLeft(y))
            .attr("class", "axisColor");

        //inflation adjusted line
        svgElement.append("path")
            .datum(formattedConstructionSpending)
            .attr("fill", "none")
            .attr("stroke", "lightcoral")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x((d) => x(d.x))
                .y((d) => y(d.yTotal))
            );

        //2008 financial crisis
        svgElement.append("line")
            .attr("y1", 0)
            .attr("y2", height)
            .attr("x1", x(new Date(2008, 7, 15)))
            .attr("x2", x(new Date(2008, 7, 15)))
            .attr("stroke", "black")
            .attr("stroke-dasharray", "5,5")
            .attr("stroke-width", "2");

        svgElement.append("text")
            .attr("text-anchor", "middle")
            .attr("x", (width / 2) + 60)
            .attr("y", height - 35)
            .text("2008 Financial Crisis");

        svgElement.append("text")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", -5)
            .text("U.S. Total Construction Spending (Jan 2024 Inflation Adjusted)");
    });

    return (
        <Box sx={{ mt: 3 }}>
            <svg ref={ref} width={width} height={height} className="noOverflow" />
        </Box>
    );

}