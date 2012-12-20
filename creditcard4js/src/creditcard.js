var creditcard = creditcard || {};

creditcard.NETWORK_VISA = "visa";
creditcard.NETWORK_MASTERCARD = "mastercard";
creditcard.NETWORK_AMERICAN_EXPRESS = "amex";
creditcard.NETWORK_DINERS = "diners";
creditcard.NETWORK_DISCOVER = "discover";
creditcard.NETWORK_ISRACARD = "isracard";
creditcard.NETWORK_MAESTRO = "maestro";
creditcard.NETWORK_SWITCH = "switch";

creditcard.ALL_NETWORKS = [
	creditcard.NETWORK_VISA, creditcard.NETWORK_MASTERCARD, creditcard.NETWORK_AMERICAN_EXPRESS, creditcard.NETWORK_DINERS,
	creditcard.NETWORK_DISCOVER, creditcard.NETWORK_ISRACARD, creditcard.NETWORK_MAESTRO, creditcard.NETWORK_SWITCH
];
	
creditcard.BankCard = creditcard.BankCard || function(params) { return (function(params) {
	var iin = params.iin;
	var network = params.network;
	var valid = params.valid;
	
	var self = {};
	
	self.getIin = function() {
		return iin;
	};
	
	self.getNetwork = function() {
		return network;
	};
	
	self.isValid = function() {
		return valid;
	};

	return self;
}(params))};

creditcard.LuhnValidator = creditcard.LuhnValidator || function() { return (function() {
	var self = {};
	
	self.calculateLuhnSum = function(num) {
		num = (num + '').replace(/\D+/g, '').split('').reverse();
		if (!num.length) {
			return false;
		}
		
		var total = 0;
		for (var i = 0, l = num.length; i < l; ++i) {
			num[i] = parseInt(num[i])
			total += i % 2 ? 2 * num[i] - (num[i] > 4 ? 9 : 0) : num[i];
		}
		return (total % 10);
	}
	
	self.validate = function(iin) {
		return (self.calculateLuhnSum(iin) == 0);
	}

	return self;
}())};

creditcard.IsracardValidator = creditcard.IsracardValidator || function() { return (function() {
	var self = {};
	
	self.calculateIsracardSum = function(num) {
		var total = 0;
		for (var i = 1, l = num.length; i <= l; ++i) {
			total += (i * parseInt(num.charAt(l - i)));
		}
		return (total % 11);
	}
	
	self.validate = function(iin) {
		return (self.calculateIsracardSum(iin) == 0);
	}

	return self;
}())};

creditcard.Parser = creditcard.Parser || (function() {
	var self = {};
	
	var luhn = new creditcard.LuhnValidator();
	var isracard = new creditcard.IsracardValidator();
	
	var infos = [
		{ network : creditcard.NETWORK_VISA, pattern : /^4[0-9]{12}([0-9]{3})?$/, validator : luhn},
		{ network : creditcard.NETWORK_MASTERCARD, pattern : /^5[1-5][0-9]{14}$/, validator : luhn},
		{ network : creditcard.NETWORK_AMERICAN_EXPRESS, pattern : /^3[47][0-9]{13}$/, validator : luhn},
		{ network : creditcard.NETWORK_DINERS, pattern : /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/, validator : luhn},
		{ network : creditcard.NETWORK_DISCOVER, pattern : /^6(?:011|5[0-9]{2})[0-9]{12}$/, validator : luhn},
		{ network : creditcard.NETWORK_ISRACARD, pattern : /^[0-9]{8,9}$/, validator : isracard},
		{ network : creditcard.NETWORK_MAESTRO, pattern : /^(5018|5020|5038|6304|6759|6761|6762|6763)[0-9]{8}([0-9]?){7}$/, validator : luhn},
		{ network : creditcard.NETWORK_SWITCH, pattern : /^((4903|4905|4911|4936|6333)[0-9]{2}|564182|633110)[0-9]{10}([0-9]{2,3})?$/, validator : luhn}
	];
	
	self.parse = function(iin) {
		for (var i = 0, l = infos.length; i < l; ++i) {
			var info = infos[i];
			if (iin.match(info.pattern)) {
				return new creditcard.BankCard({
					iin : iin,
					network : info.network,
					valid : (info.validator ? info.validator.validate(iin) : true)
				});
			}
		}
		return null;
	};
	
	return self;
}());

// syntactic sugar
creditcard.parse = creditcard.Parser.parse;