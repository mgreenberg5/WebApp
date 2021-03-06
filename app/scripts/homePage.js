var _ = require('lodash');
import { BreweryDB } from 'scripts/breweryDB.js'

class HomePage {
  constructor() {
    this.selectedCategoryStyle = null;
    this.beerData = null;
    this.bindEvents();
    this.breweryDB = new BreweryDB();
    this.breweryDB.fetchStyles()
      .then((data) => { this.populateBeerData(data);})
      .catch((error) => { this.populateBeerDataFailed();});
  }

  hideBeerCardContainer() {
    $('.beer-card-container').hide();
  }

  hideLoader() {
    $('.loader-container').hide();
  }

  showBeerCardContainer() {
    $('.loader-container').show();
    $('.beer-card-container').show();
  }

  populateBeerData(data) {
    this.beerData = data;
    this.populateQuestionOne();
  }

  populateBeerDataFailed() {
    var errorMessage  = [
        '<div class="twelve columns text-center">',
          '<h1>Oops Something Went Wrong</h1>',
        '</div>'
      ].join('');
    $(".beer-list").append(errorMessage);
    this.showBeerCardContainer();
    this.hideLoader();
  }

  populatePlaceholderOption(select){
    select.append('<option disabled selected value> -- select an option -- </option>');
  }

  populateQuestionOne() {
    var questionOne = $('.question-one');
    var uniqueBeerCategories = _.uniqBy(this.beerData.data, 'categoryId');
    this.populatePlaceholderOption(questionOne);
    _.forEach(uniqueBeerCategories, function(beerCategory) {
      var categoryOption = '<option value="' + beerCategory.categoryId + '">'+ beerCategory.category.name + '</option>'
      questionOne.append(categoryOption);
    })
  }

  populateBeerContainer(data) {
    this.hideLoader();
    _.forEach(data.data, function(beer) {
      var logo = (typeof beer.labels == 'undefined') ? '/images/default-label.png' : beer.labels.medium
      var availableHTML = (typeof beer.available == 'undefined') ? '' : '<p class="available">Availability: <span class="highlight">' + beer.available.name + '</span></p>';
      var abvHTML = (typeof beer.abv == 'undefined') ? '' : '<p class="abv">ABV: <span class="highlight">' + beer.abv + '</span></p>';
      var ibuHTML = (typeof beer.ibu == 'undefined') ? '' : '<p class="ibu">IBU: <span class="highlight">' + beer.ibu + '</span></p>';
      var glassHTML = (typeof beer.glass == 'undefined') ? '' : '<h5 class="glass">Serving: ' + beer.glass.name + '</h5>';
      var descriptionHTML = (typeof beer.description == 'undefined') ? '' : '<h5 class="description">' + beer.description + '</h5>';
      var flipArrowHTML = (typeof beer.glass == 'undefined' && typeof beer.description == 'undefined') ? '' : '<img class="flip-arrow" src="/images/flip-arrow.png">';
      var beerCard = [
        '<div class="column flip-container">',
          '<div class="flipper">',
            '<div class="front">',
              '<img class="logo" src="' + logo + '"/>',
              '<h4 class="name">' + beer.name + '</h4>',
              availableHTML,
              abvHTML,
              ibuHTML,
              flipArrowHTML,
            '</div>',
            '<div class="back">',
              '<div class="scroll-container">',
                glassHTML,
                descriptionHTML,
              '</div>',
              '<img class="flip-arrow" src="/images/flip-arrow-white.png">',
            '</div>',
          '</div>',
        '</div>'
      ].join('');
      $('.beer-list').append(beerCard);
    })
    this.generatePaging(data);
    this.bindEventsGeneratedContent();
  }

  resetSelectOptions(select) {
    select.find('option').remove();
  }

  resetBeerList() {
    $('.beer-list').find('.flip-container').remove();
    $('.pagination').children().remove();
  }

  handleQuestionOneAction() {
    var questionTwo = $('.question-two');
    var selectedCategory = $('.question-one').val();
    this.hideBeerCardContainer();
    this.resetBeerList();
    this.resetSelectOptions(questionTwo);
    this.populatePlaceholderOption(questionTwo);
    _.forEach(this.beerData.data, function(categoryStyle) {
      if(categoryStyle.categoryId == selectedCategory) {
        var categoryStyleOption = '<option value="' + categoryStyle.id + '">'+ categoryStyle.name + '</option>'
        questionTwo.append(categoryStyleOption);
      }
    })
    $('.question-two-container').show();
  }

  handleQuestionTwoAction() {
    this.selectedCategoryStyle = $('.question-two').val();
    var paramaters = '&styleId='+ this.selectedCategoryStyle + '&p=1&sort=ASC'
    this.resetBeerList();
    this.showBeerCardContainer();
    this.breweryDB.fetchBeers(paramaters)
      .then((data) => { this.populateBeerContainer(data);})
      .catch((error) => { this.populateBeerDataFailed(error);});
  }

  handlePageClick() {
    var page = $(event.target).data('page-number');
    var paramaters = '&styleId='+ this.selectedCategoryStyle + '&p='+ page + '&sort=ASC'
    this.resetBeerList();
    this.showBeerCardContainer();
    this.breweryDB.fetchBeers(paramaters)
      .then((data) => { this.populateBeerContainer(data);})
      .catch((error) => { this.populateBeerDataFailed(error);});
  }

  handleCardFlip () {
    $(event.target).closest('.flip-container').toggleClass('flipped');
  }

  generatePaging(data) {
    if(data.numberOfPages == 1){ return; }
    for (var i = 1; i <= data.numberOfPages; i++) {
      if(data.currentPage == i) {
        var page = '<a class="page-number selected" data-page-number='+ i +'>' + i + '</a>'
      } else {
        var page = '<a class="page-number" data-page-number='+ i +'>' + i + '</a>'
      }
      $('.pagination').append(page);
    }
  }

  bindEventsGeneratedContent () {
    $('.flip-arrow').on('click', this.handleCardFlip.bind(this));
    $('.page-number').on('click', this.handlePageClick.bind(this));
  }

  bindEvents() {
    $('.question-one').on('change', this.handleQuestionOneAction.bind(this));
    $('.question-two').on('change', this.handleQuestionTwoAction.bind(this));
  }
}

export { HomePage }
