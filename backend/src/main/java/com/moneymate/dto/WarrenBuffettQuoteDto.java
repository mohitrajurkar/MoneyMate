package com.moneymate.dto;

public class WarrenBuffettQuoteDto {
    private String id;
    private String quote;
    private String context;
    private String author;

    public WarrenBuffettQuoteDto() {
    }

    public WarrenBuffettQuoteDto(String id, String quote, String context, String author) {
        this.id = id;
        this.quote = quote;
        this.context = context;
        this.author = author;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getQuote() {
        return quote;
    }

    public void setQuote(String quote) {
        this.quote = quote;
    }

    public String getContext() {
        return context;
    }

    public void setContext(String context) {
        this.context = context;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }
}
