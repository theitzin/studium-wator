# LaTeX Makefile
FILE=wator

all: $(FILE).pdf

.PHONY: clean
clean:
	rm *.aux *.bbl *.bcf *.blg *.log *.run.xml *.synctex.gz *.toc *.lof *.pdf

$(FILE).pdf: $(FILE).tex
	pdflatex -synctex=1 -interaction=nonstopmode $(FILE)
	pdflatex -synctex=1 -interaction=nonstopmode $(FILE)
	biber $(FILE)
	pdflatex -synctex=1 -interaction=nonstopmode $(FILE)
	pdflatex -synctex=1 -interaction=nonstopmode $(FILE)
	rm *.aux *.bbl *.bcf *.blg *.log *.run.xml *.synctex.gz *.toc *.lof
	#evince wator.pdf &
